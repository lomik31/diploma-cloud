import { trim } from "../utils/text";

interface Props {
  text?: string | null;
  limit?: number;
  className?: string;
};

function TrimmedText({ text, limit = 100, className }: Props) {
    const full = (text ?? "").trim();
    if (!full)
        return null;

    const classes = "trimmed-text" + (className ? ` ${className}` : "");

    return (
        <span className={classes} title={full} aria-label={full}>
            {trim(full, limit)}
        </span>
    );
}

export default TrimmedText;
