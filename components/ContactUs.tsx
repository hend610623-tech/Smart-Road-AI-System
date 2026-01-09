
import React from 'react';
import { MailIcon, PhoneIcon } from './Icons';

const ContactUs: React.FC = () => {
    return (
        <div className="flex flex-col h-full bg-background">
            <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">Contact Us</h2>
                <p className="text-sm text-gray-300">Get in touch with the project team.</p>
            </div>
            <div className="flex-grow p-8 flex items-center justify-center overflow-y-auto">
                <div className="w-full max-w-md bg-background/50 p-8 rounded-lg shadow-lg">
                    <ul className="space-y-8">
                        <li className="flex items-start gap-4">
                            <MailIcon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                            <div className="flex-grow">
                                <h3 className="font-semibold text-gray-200 mb-2">Emails</h3>
                                <div className="flex flex-col space-y-2">
                                    <a href="mailto:Hend.1923548@stemgharbiya.moe.edu.eg" className="text-primary hover:underline break-all text-sm">
                                        Hend.1923548@stemgharbiya.moe.edu.eg
                                    </a>
                                    <a href="mailto:mariam.1923543@stemgharbiya.moe.edu.eg" className="text-primary hover:underline break-all text-sm">
                                        mariam.1923543@stemgharbiya.moe.edu.eg
                                    </a>
                                    <a href="mailto:salma.1923531@stemgharbiya.moe.edu.eg" className="text-primary hover:underline break-all text-sm">
                                        salma.1923531@stemgharbiya.moe.edu.eg
                                    </a>
                                </div>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <PhoneIcon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                            <div className="flex-grow">
                                <h3 className="font-semibold text-gray-200 mb-2">Contact Numbers</h3>
                                <div className="flex flex-col space-y-2">
                                    <a href="tel:+201507349940" className="text-primary hover:underline text-sm">
                                        +20 150 734 9940
                                    </a>
                                    <a href="tel:+201274628997" className="text-primary hover:underline text-sm">
                                        +20 127 462 8997
                                    </a>
                                    <a href="tel:+201022956605" className="text-primary hover:underline text-sm">
                                        +20 102 295 6605
                                    </a>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;