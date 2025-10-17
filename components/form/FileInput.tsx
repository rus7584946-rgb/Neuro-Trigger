import React from 'react';

const FileInput: React.FC<{
  id: string;
  label: string;
  files: File[] | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept: string;
  multiple?: boolean;
}> = ({ id, label, files, onChange, accept, multiple = false }) => {
    const hasFiles = files && files.length > 0;
    return (
        <div className="w-full">
            {label && <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-300">{label}</label>}
            <label htmlFor={id} className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${hasFiles ? 'border-blue-500 bg-gray-800' : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'}`}>
                <span className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                    <svg className={`w-8 h-8 mb-4 ${hasFiles ? 'text-blue-400' : 'text-gray-500'}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                    <span className={`block mb-2 text-sm px-2 ${hasFiles ? 'text-blue-300' : 'text-gray-400'}`}>
                        {hasFiles ? <span className="font-semibold">{files.length > 1 ? `Выбрано: ${files.length}` : files[0].name}</span> : <span><span className="font-semibold">Загрузите</span> или перетащите</span>}
                    </span>
                    {!hasFiles && <span className="block text-xs text-gray-500">{accept}</span>}
                </span>
                <input id={id} type="file" className="hidden" onChange={onChange} accept={accept} multiple={multiple} />
            </label>
        </div>
    );
};

export { FileInput };
