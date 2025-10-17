import React, { useRef, useEffect } from 'react';

const TextInput: React.FC<{
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder: string;
    as?: 'textarea';
    isLoading?: boolean;
}> = ({ id, label, value, onChange, placeholder, as = 'input', isLoading = false }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Этот эффект обрабатывает автоматическое изменение размера текстового поля.
    useEffect(() => {
        if (as === 'textarea' && textareaRef.current) {
            const textarea = textareaRef.current;
            // Временно сжимаем текстовое поле, чтобы правильно рассчитать новую scrollHeight.
            textarea.style.height = 'auto'; 
            // Устанавливаем новую высоту в зависимости от содержимого.
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [value, as]); // Перезапускаем при изменении значения или типа компонента.

    const baseClasses = "w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5 text-gray-200 focus:ring-blue-500 focus:border-blue-500 transition";
    
    const commonProps = {
        id, 
        value, 
        onChange, 
        placeholder,
        disabled: isLoading,
    };

    return (
        <div className="relative">
            <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-300">{label}</label>
            {as === 'textarea' ? (
                <textarea
                    {...commonProps}
                    ref={textareaRef}
                    rows={1}
                    className={`${baseClasses} resize-none overflow-hidden`} // Специальные классы для textarea
                />
            ) : (
                <input type="text" {...commonProps} className={baseClasses} />
            )}
            {isLoading && (
                 <div className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center pointer-events-none">
                     <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
        </div>
    );
}

export { TextInput };