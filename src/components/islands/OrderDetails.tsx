import React from 'react';

interface OrderDetailsProps {
    status: string;
}

export default function OrderDetails({ status }: OrderDetailsProps) {
    const currentStatus = status.toLowerCase();

    // Estados mapeados a 4 pasos:
    // 0: Pendiente (pending)
    // 1: Pagado (paid)
    // 2: Enviado (shipped)
    // 3: Entregado (delivered)

    let activeIndex = 0;
    if (currentStatus === 'paid') activeIndex = 1;
    if (currentStatus === 'shipped') activeIndex = 2;
    if (currentStatus === 'delivered') activeIndex = 3;
    // Backward compat: old values
    if (currentStatus === 'processing' || currentStatus === 'confirmed') activeIndex = 1;
    if (currentStatus === 'completed') activeIndex = 3;

    const steps = [
        {
            label: 'Pendiente',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            label: 'Pagado',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            )
        },
        {
            label: 'Enviado',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
            )
        },
        {
            label: 'Entregado',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )
        }
    ];

    return (
        <div className="w-full mt-6 px-4">
            <div className="relative flex items-center justify-between w-full">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2 rounded-full"></div>

                {/* Active Progress Line */}
                <div
                    className="absolute top-1/2 left-0 h-1 bg-green-500 -z-10 transform -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const isCompleted = index <= activeIndex;
                    const isCurrent = index === activeIndex;

                    return (
                        <div key={index} className="flex flex-col items-center bg-white px-2">
                            <div
                                className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                  ${isCompleted
                                        ? 'bg-green-500 border-green-500 text-white shadow-md scale-110'
                                        : 'bg-white border-gray-300 text-gray-400'
                                    }
                `}
                            >
                                {/* Show checkmark for past completed steps, otherwise show the step icon */}
                                {isCompleted && index < activeIndex ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    step.icon
                                )}
                            </div>
                            <span
                                className={`
                  mt-2 text-xs md:text-sm font-semibold transition-colors duration-300
                  ${isCompleted ? 'text-green-600' : 'text-gray-400'}
                  ${isCurrent ? 'scale-105' : ''}
                `}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
