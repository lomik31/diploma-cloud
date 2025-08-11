import { Link } from "react-router-dom";
import { UploadCloud, Share2, ShieldCheck, FilePenLine } from "lucide-react";

import NavBar from "../components/Navbar";
import "./Welcome.css";

function Welcome() {
    return (
        <div className="welcome-page">
            <NavBar />
            <main className="welcome-content">
                <section className="welcome-hero">
                    <h1 className="welcome-title">ломка — простое файловое хранилище</h1>
                    <p className="welcome-subtitle">
                        Загружайте, делитесь и управляйте файлами — быстро и без лишнего шума.
                    </p>

                    <div className="welcome-actions">
                        <Link to="/login" state={{ background: location }} className="navbar__btn">
                            Войти или зарегистрироваться
                        </Link>
                    </div>

                    <p className="welcome-hint">
                        Поддерживается загрузка, комментарии к файлам, шаринг по ссылке и редактирование
                        метаданных — всё в пару кликов.
                    </p>
                </section>

                <section className="welcome-features">
                    <div className="feature-grid">
                        <article className="feature-card">
                            <UploadCloud className="feature-icon" />
                            <h3 className="feature-title">Быстрая загрузка</h3>
                            <p className="feature-text">
                                Выберите файлы и загрузите их одним действием. Комментарии к каждому файлу — по желанию.
                            </p>
                        </article>

                        <article className="feature-card">
                            <Share2 className="feature-icon" />
                            <h3 className="feature-title">Общий доступ</h3>
                            <p className="feature-text">
                                Создавайте ссылку на файл и делитесь ей с коллегами за секунды.
                            </p>
                        </article>

                        <article className="feature-card">
                            <FilePenLine className="feature-icon" />
                            <h3 className="feature-title">Переименование и заметки</h3>
                            <p className="feature-text">
                                Редактируйте имя и комментарий — удобно хранить контекст и быстрее находить нужное.
                            </p>
                        </article>

                        <article className="feature-card">
                            <ShieldCheck className="feature-icon" />
                            <h3 className="feature-title">Контроль доступа</h3>
                            <p className="feature-text">
                                Админы управляют пользователями и объёмами — всё под контролем.
                            </p>
                        </article>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Welcome;
