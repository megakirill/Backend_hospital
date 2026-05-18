interface Props {
    type?: string;
    placeholder: string;
    value: string;
    onChange: (
        e: React.ChangeEvent<HTMLInputElement>
    ) => void;
    name: string;
}

export default function AuthInput({
    type = "text",
    placeholder,
    value,
    onChange,
    name,
}: Props) {

    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            className="
                h-14
                w-full
                rounded-2xl
                border
                border-white/10
                bg-white/5
                px-5
                text-white
                outline-none
                transition-all
                placeholder:text-slate-500
                focus:border-cyan-400
                focus:bg-white/10
            "
        />
    );
}