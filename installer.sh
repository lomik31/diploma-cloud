#!/usr/bin/env bash

set -e

####################### ПОДГОТОВКА #######################

DJANGO_SECRET=$(openssl rand -base64 48 | tr -d '\n' | tr '/+' '_-' | cut -c1-50)
echo "DJANGO_SECRET_KEY=$DJANGO_SECRET" > ./backend/.env


#################### УСТАНОВКА DOCKER ####################

NEED_DOCKER=true
NEED_DOCKER_COMPOSE=true

set +e
docker --version > /dev/null
if [ $? -eq 0 ]; then
    NEED_DOCKER=false
else
    echo "Docker не найден и будет установлен."
fi
set -e

if [ "$NEED_DOCKER" == false ]; then
    set +e
    docker compose version > /dev/null
    if [ $? -eq 0 ]; then
        NEED_DOCKER_COMPOSE=false
    else
        echo "Docker Compose не найден и будет установлен."
    fi
    set -e
fi

if [ "$NEED_DOCKER" == true ] || [ "$NEED_DOCKER_COMPOSE" == true ]; then
    echo "Устанавливаем Docker..."
    curl -s https://get.docker.com | bash
    echo "Docker успешно установлен."
    echo "Добавляем текущего пользователя в группу docker..."
    sudo usermod -aG docker "$USER"
    echo "Пожалуйста, перезапустите сессию, чтобы изменения вступили в силу и запустите скрипт снова."
    exit 1
fi

######################### ДОМЕНЫ #########################

lower() { printf '%s' "$1" | tr '[:upper:]' '[:lower:]'; }

is_ipv4() {
    local s="$1" IFS=.

    set -f
    local parts=($s)
    set +f

    [ "${#parts[@]}" -eq 4 ] || return 1
    local p
    for p in "${parts[@]}"; do
        [[ "$p" =~ ^[0-9]+$ ]] || return 1
        if [ "${#p}" -gt 1 ] && [[ "$p" =~ ^0 ]]; then return 1; fi
        [ "$p" -ge 0 ] && [ "$p" -le 255 ] || return 1
    done
    return 0
}

is_valid_label() {
    local l="$1"
    [ "${#l}" -ge 1 ] && [ "${#l}" -le 63 ] || return 1
    [[ "$l" =~ ^[A-Za-z0-9-]+$ ]] || return 1
    [[ "$l" =~ ^- ]] && return 1
    [[ "$l" =~ -$ ]] && return 1
    local ll; ll=$(lower "$l")
    [[ "$ll" == xn--* ]] && return 1
    return 0
}

is_valid_hostname() {
    local h="$1"

    [[ "$h" =~ ^[A-Za-z0-9.-]+$ ]] || return 1

    [[ "$h" == .* ]] && return 1
    [[ "$h" == *. ]] && return 1
    [[ "$h" == *..* ]] && return 1

    local IFS=.

    set -f
    local labels=($h)
    set +f

    local lbl
    for lbl in "${labels[@]}"; do
        is_valid_label "$lbl" || return 1
    done

    if [ "${#labels[@]}" -ge 2 ]; then
        [ "${#h}" -le 253 ] || return 1
    fi
    return 0
}

validate_domains_csv() {
    local in="$1"
    DOMAINS_OUT=""

    [ -z "$in" ] && return 0

    printf '%s' "$in" | grep -q '[[:space:]]' && {
        echo "Ошибка: пробелы недопустимы. Используйте запятые без пробелов." >&2
        return 1
    }

    local remains="$in" item
    local out_list=()
    while :; do
        item=${remains%%,*}

        if [ "$remains" = "$item" ]; then
            remains=''
        else
            remains=${remains#*,}
        fi

        [ -n "$item" ] || { echo "Ошибка: пустой элемент (лишняя запятая)." >&2; return 1; }

        local item_lc; item_lc=$(lower "$item")

        if is_ipv4 "$item_lc"; then
            :
        elif is_valid_hostname "$item_lc"; then
            :
        else
            echo "Невалидный домен/IP: $item" >&2
            return 1
        fi

        out_list+=("$item_lc")
        [ -z "$remains" ] && break
    done

    local IFS=,
    DOMAINS_OUT="${out_list[*]}"
    return 0
}

printf "Введите ваш домен.\nЕсли у вас несколько доменов, введите их через запятую без пробела. Например: example.com,test.org,127.0.0.1,localhost\nЕсли у вас нет доменов, пропустите этот шаг, нажав Enter: "
read PRE_DOMAINS
if [ -z "$PRE_DOMAINS" ]; then
    echo "Домен не указан. Используется IP-адрес машины."
    PRE_DOMAINS=$(curl https://ifconfig.io)
else
    if validate_domains_csv "$PRE_DOMAINS"; then
        if [ -z "$DOMAINS_OUT" ]; then
            echo "Домены не указаны — пропускаем."
        else
            echo "Будут использованы эти домены: $DOMAINS_OUT"
        fi
    else
        echo "Ввод не прошёл проверку"
        exit 1
    fi
fi

echo "DOMAINS=$DOMAINS_OUT" >> .env

###################### СЕРТИФИКАТЫ ######################

if [ ls certs/*.crt >/dev/null ] && [ ls certs/*.key ]
then
    echo "Сертификаты найдены. Используем их."
else
    printf "Есть ли у вас TLS-сертификат (и ключ) для вышеперечисленных доменов? (y/n): "
    read SKIP_CERTS
    if [ "$SKIP_CERTS" = "y" ]; then
        echo "Пожалуйста, положите fullchain-сертификат по пути certs/fullchain.crt и ключ в certs/private.key и запустите скрипт снова."
        echo "Файлы обязательно должны быть в форматах .crt и .key соответственно."
        echo "Прерываю..."
        exit 1
    elif [ "$SKIP_CERTS" = "n" ]; then
        echo "В процессе установки будут сгенерированы самоподписанные сертификаты. После установки вы можете добавить CA-сертификат в директории certs/ в список доверенных сертификатов вашего браузера/системы."
    else
        echo "Неверный ввод. Пожалуйста, введите 'y' или 'n'."
        exit 1
fi

#################### СОЗДАНИЕ ВОЛЬЮМОВ ####################

docker volume create prod_postgres_data
docker volume create userfiles

################## ЗАПУСК DOCKER COMPOSE ##################

export DOMAINS
docker compose up -d
