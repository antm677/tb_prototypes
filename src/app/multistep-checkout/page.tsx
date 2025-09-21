"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import packages from '../../data/packages.json';

const steps = ["Select a package", "Choose addons", "Complete purchase"];

const integerPriceFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

const decimalPriceFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const formatPrice = (price: number) => {
    return price % 1 === 0 ? integerPriceFormatter.format(price) : decimalPriceFormatter.format(price);
};

interface Challenge {
    Id: number;
    Name: string;
    InitialCredit: number;
    TargetProfitPercentage: number;
    PropChallengeOrder: number;
}

interface Addon {
    Id: number;
    Name: string;
    Description: string;
    IsEnabled: boolean;
    PackagePriceIncreasePercentage: number;
    MarginCoefficient: number | null;
    TargetProfitPercentage: number | null;
    MaxLossPercentage: number | null;
    MinTradingDays: number | null;
    WithdrawalsDelayInDays: number | null;
    ProfitSharePercentage: number | null;
}

interface Package {
    Id: number;
    Name: string;
    PromotionTitle: string;
    Price: number;
    ActualPrice: number;
    Challenges: Challenge[];
    ProfitSharePercentage: number;
    MaxLossPercentage: number;
    DailyLossPercentage: number;
    IsFeaturedPackage?: boolean;
    SymbolCategory?: string;
    Addons: Addon[];
}

const PackageCard = ({ pkg, isSelected, onSelect }: { pkg: Package, isSelected: boolean, onSelect: (id: number) => void }) => {
    const [activeChallengeIndex, setActiveChallengeIndex] = useState(0);
    const challenges = pkg.Challenges.sort((a, b) => a.PropChallengeOrder - b.PropChallengeOrder);
    const activeChallenge = challenges[activeChallengeIndex];

    const features = activeChallenge ? [
        `Capital: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(activeChallenge.InitialCredit || 0)}`,
        `Profit Share: ${pkg.ProfitSharePercentage}%`,
        `Max Loss: ${pkg.MaxLossPercentage}%`,
        `Daily Loss: ${pkg.DailyLossPercentage}%`,
        `Target profit: ${activeChallenge.TargetProfitPercentage}%`,
    ] : [];

    return (
        <div
            key={pkg.Id}
            onClick={() => onSelect(pkg.Id)}
            className={`relative cursor-pointer border-2 rounded-xl p-6 text-center transition-all duration-300 ease-in-out flex flex-col ${isSelected ? 'border-[#08a9c1] shadow-2xl scale-105' : 'border-gray-200 hover:shadow-lg'}`}
        >
            {pkg.PromotionTitle && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-[#08a9c1] text-white px-4 py-1 text-sm font-bold rounded-full shadow-md max-w-[80%] truncate">
                    {pkg.PromotionTitle}
                </div>
            )}
            <h3 className="truncate text-2xl font-bold mb-4 mt-5 font-['Poppins',_Roboto,_sans-serif]">{pkg.Name}</h3>
            <div className="flex justify-center items-center gap-x-2 mb-6">
                <p className="text-4xl font-extrabold font-['Poppins',_Roboto,_sans-serif]">{formatPrice(pkg.Price)}</p>
                {pkg.ActualPrice > 0 && pkg.ActualPrice !== pkg.Price && (
                    <p className="text-2xl font-medium text-gray-400 line-through">{formatPrice(pkg.ActualPrice)}</p>
                )}
            </div>

            {challenges.length > 1 && (
                <div className="flex border-b border-gray-200 mb-4">
                    {challenges.map((challenge, index) => (
                        <button
                            key={challenge.Id}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveChallengeIndex(index);
                            }}
                            className={`flex-1 py-2 text-sm font-medium transition-colors truncate ${activeChallengeIndex === index ? 'border-b-2 border-[#08a9c1] text-[#08a9c1]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {challenge.Name}
                        </button>
                    ))}
                </div>
            )}

            <ul className="text-left space-y-3 text-gray-600 flex-grow">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                        <svg className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        <span>{feature}</span>
                    </li>
                ))}
                {pkg.SymbolCategory && (
                    <li className="flex items-center">
                        <svg className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        <span className="truncate">{pkg.SymbolCategory}</span>
                    </li>
                )}
            </ul>
        </div>
    );
};

const SelectPackageContent = ({ packages, selectedPackage, onSelectPackage }: { packages: Package[], selectedPackage: number | null, onSelectPackage: (id: number) => void }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
            {packages.map((pkg) => (
                <PackageCard key={pkg.Id} pkg={pkg} isSelected={selectedPackage === pkg.Id} onSelect={onSelectPackage} />
            ))}
        </div>
    );
};

const ChooseAddonsContent = ({ addons, selectedAddons, onToggleAddon, packagePrice }: { addons: Addon[], selectedAddons: number[], onToggleAddon: (id: number) => void, packagePrice: number }) => {
    if (addons.length === 0) {
        return (
            <div className="text-center py-16">
                <h3 className="text-2xl font-bold mb-4">No Add-ons Available</h3>
                <p className="text-gray-500">There are no add-ons available for the selected package.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="space-y-4">
                {addons.map((addon) => {
                    const isSelected = selectedAddons.includes(addon.Id);

                    return (
                        <div key={addon.Id} onClick={() => onToggleAddon(addon.Id)} className={`flex items-center justify-between p-6 border-2 rounded-xl cursor-pointer transition-all ${isSelected ? 'border-[#08a9c1] bg-cyan-50/50' : 'border-gray-200 bg-white'}`}>
                            <div className="flex-1 pr-8">
                                <h4 className="text-lg font-bold text-gray-800">{addon.Name}</h4>
                                <p className="text-sm text-gray-500 mt-1">{addon.Description}</p>
                            </div>
                            <div className="flex items-center space-x-6">
                                <div className="text-lg font-bold text-[#08a9c1]">
                                    +{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((packagePrice * addon.PackagePriceIncreasePercentage) / 100)}
                                </div>
                                <button
                                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isSelected ? 'bg-[#08a9c1]' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isSelected ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const FormField = ({ id, label, type = 'text', value, onChange }: { id: string, label: string, type?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="relative mt-2">
        <input
            id={id}
            name={id}
            type={type}
            value={value}
            onChange={onChange}
            className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-[#08a9c1]"
            placeholder={label}
        />
        <label
            htmlFor={id}
            className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[#08a9c1] peer-focus:text-sm"
        >
            {label}
        </label>
    </div>
);

const CardForm = ({
    totalPrice,
    totalActualPrice,
    cardName, setCardName,
    cardNumber, setCardNumber,
    expiryDate, setExpiryDate,
}: {
    totalPrice: number, totalActualPrice: number, cardName: string, setCardName: (v: string) => void, cardNumber: string, setCardNumber: (v: string) => void, expiryDate: string, setExpiryDate: (v: string) => void
}) => {
    const [currency, setCurrency] = useState('USD');
    const [promoCode, setPromoCode] = useState('');
    return (
        <div className="mt-8 p-6">
            <div className="flex justify-between items-start">
                <div className="flex flex-col items-start">
                    <span className="text-3xl font-normal text-gray-800 font-['Poppins',_Roboto,_sans-serif]">{formatPrice(totalPrice)}</span>
                    {totalActualPrice > totalPrice && (
                        <span className="text-sm font-medium text-[#8b939b] line-through">{formatPrice(totalActualPrice)}</span>
                    )}
                </div>
                <div className="relative">
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="h-10 appearance-none rounded-none border-b-2 border-gray-300 bg-transparent py-2 pl-3 pr-10 text-sm focus:border-[#08a9c1] focus:outline-none"
                    >
                        <option>USD</option>
                        <option>EUR</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>
            <div className="space-y-8 mt-8">
                <FormField id="cardName" label="Name on card" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                <FormField id="cardNumber" label="Card number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                        <FormField id="expiryDate" label="MM/YY" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                    </div>
                    <div className="flex-1">
                        <FormField id="cvv" label="CVV" value="" onChange={() => { }} />
                    </div>
                </div>
                <div className="flex items-end gap-4">
                    <div className="flex-grow">
                        <FormField id="promoCodeCard" label="Promotion code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                    </div>
                    <button className="h-10 px-6 text-sm font-semibold text-[#08a9c1] hover:text-[#0798ab]">
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

const SkrillForm = ({ totalPrice, totalActualPrice }: { totalPrice: number, totalActualPrice: number }) => {
    const [promoCode, setPromoCode] = useState('');
    return (
        <div className="mt-8 p-6">
            <p className="text-sm text-gray-500">You will be charged</p>
            <div className="flex items-baseline gap-x-2">
                <span className="text-3xl font-bold text-gray-800">{formatPrice(totalPrice)}</span>
                {totalActualPrice > totalPrice && (
                    <span className="text-xl text-gray-400 line-through">{formatPrice(totalActualPrice)}</span>
                )}
            </div>
            <div className="mt-8">
                <div className="flex items-end gap-4">
                    <div className="flex-grow">
                        <FormField id="promoCodeSkrill" label="Promotion code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                    </div>
                    <button className="h-10 px-6 text-sm font-semibold text-[#08a9c1] hover:text-[#0798ab]">
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

const paymentMethods = [
    { id: 'card', name: 'Credit Card', src: '/pm_credit_cards.png', width: 150, height: 24 },
    { id: 'skrill', name: 'Skrill', src: '/skrill.png', width: 80, height: 24 },
];


const CompletePurchaseContent = ({
    selectedPaymentMethod,
    onSelectPaymentMethod,
    totalPrice,
    totalActualPrice,
    currentPackage,
    selectedAddonDetails,
    setOrderDetailsVisible
}: {
    selectedPaymentMethod: string | null, onSelectPaymentMethod: (id: string) => void, totalPrice: number, totalActualPrice: number, currentPackage: Package | undefined, selectedAddonDetails: Addon[], setOrderDetailsVisible: (visible: boolean) => void
}) => {
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');

    const orderDetailsRef = useRef<HTMLDivElement>(null);
    const totalOrderDetailsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setOrderDetailsVisible(entry.isIntersecting),
            { threshold: 0.1 }
        );

        const currentRef = totalOrderDetailsRef.current;
        if (currentRef) observer.observe(currentRef);

        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, [setOrderDetailsVisible]);

    return (
        <div className="mt-8">
            <div className="max-w-[674px]">
                {selectedPaymentMethod === 'card' ?
                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <div className="pl-6">
                                <h4 className="text-lg font-['Poppins',_Roboto,_sans-serif] mb-4">Choose payment method</h4>
                                <div className="flex gap-4">
                                    {paymentMethods.map((method) => (<div key={method.id} onClick={() => onSelectPaymentMethod(method.id)} className={`cursor-pointer p-4 border-2 rounded-lg transition-all flex items-center justify-center h-[56px] w-[116px] ${selectedPaymentMethod === method.id ? 'border-[#08a9c1] shadow-lg' : 'border-gray-200 hover:shadow-md'}`}><Image src={method.src} alt={method.name} width={method.width} height={method.height} className="object-contain" /></div>))}
                                </div>
                            </div>
                            <CardForm totalPrice={totalPrice} totalActualPrice={totalActualPrice} cardName={cardName} setCardName={setCardName} cardNumber={cardNumber} setCardNumber={setCardNumber} expiryDate={expiryDate} setExpiryDate={setExpiryDate} />
                        </div>
                        <div className="w-1/2 flex flex-col justify-center gap-4">
                            <div className="relative w-[295px] h-[168px] bg-no-repeat bg-contain rounded-2xl shadow-lg p-6 text-white font-['Poppins',_Roboto,_sans-serif]" style={{ backgroundImage: "url('/credit_card_active.png')" }}>
                                <div className="absolute top-20 left-6">
                                    {cardNumber ?
                                        <div className="text-2xl tracking-[0.2em]">{cardNumber}</div> :
                                        <div className="flex items-center gap-x-2 text-2xl">
                                            {[...Array(4)].map((_, groupIndex) => (
                                                <span key={groupIndex} className="text-[19px]">••••</span>
                                            ))}
                                        </div>
                                    }
                                </div>
                                <div className="absolute bottom-6 left-6">
                                    <div className="text-[12.6px]">{cardName || 'NAME ON CARD'}</div>
                                </div>
                                <div className="absolute bottom-6 right-6">
                                    <div className="text-[12.6px]">{expiryDate || 'MM/YY'}</div>
                                </div>
                            </div>
                            <p className="font-['Poppins',_Roboto,_sans-serif] text-[#8b939b] text-[14px]">Guaranteed safe & secure checkout</p>
                            <Image src="/ic_cc_ssl.png" alt="SSL" width={300} height={42} />
                            <div className="flex gap-2">
                                <Image src="/visa.png" alt="Visa" width={48} height={12} />
                                <Image src="/master.png" alt="Mastercard" width={50} height={12} />
                                <Image src="/maestro.png" alt="Maestro" width={50} height={12} />
                            </div>
                        </div>
                    </div>
                    : <>
                        <div className="pl-6">
                            <h4 className="text-lg font-semibold mb-4">Choose payment method</h4>
                            <div className="flex gap-4">
                                {paymentMethods.map((method) => (<div key={method.id} onClick={() => onSelectPaymentMethod(method.id)} className={`cursor-pointer p-4 border-2 rounded-lg transition-all flex items-center justify-center h-[56px] w-[116px] ${selectedPaymentMethod === method.id ? 'border-[#08a9c1] shadow-lg' : 'border-gray-200 hover:shadow-md'}`}><Image src={method.src} alt={method.name} width={method.width} height={method.height} className="object-contain" /></div>))}
                            </div>
                        </div>
                        <SkrillForm totalPrice={totalPrice} totalActualPrice={totalActualPrice} />
                    </>
                }</div>
            {currentPackage && (
                <div ref={orderDetailsRef} className="pl-6 pr-6 pb-16 mt-12 max-w-[674px]">
                    <h4 className="text-lg font-semibold mb-4">Order details</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between font-medium">
                            <span>Package: {currentPackage.Name}</span>
                            <span>{formatPrice(currentPackage.Price)}</span>
                        </div>
                        {selectedAddonDetails.length > 0 && (
                            <ul className="pl-4 space-y-1 border-b border-gray-200 pb-3">
                                {selectedAddonDetails.map(addon => (
                                    <li key={addon.Id} className="flex justify-between text-sm text-gray-600">
                                        <span>{addon.Name}</span>
                                        <span>+{formatPrice((currentPackage.Price * addon.PackagePriceIncreasePercentage) / 100)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2">
                            <span ref={totalOrderDetailsRef}>Total</span>
                            <span>{formatPrice(totalPrice)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const MultistepCheckout = ({ onBack }: { onBack: () => void }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [selectedPackage, setSelectedPackage] = useState<number | null>(2);
    const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>('card');
    const [isOrderDetailsVisible, setOrderDetailsVisible] = useState(true);

    const handleNext = () => {
        setActiveStep((prev) => Math.min(steps.length - 1, prev + 1));
    };

    const handleBack = () => {
        setActiveStep((prev) => Math.max(0, prev - 1));
    };

    const handleSelectPackage = (packageId: number) => {
        if (selectedPackage !== packageId) {
            setSelectedAddons([]);
        }
        setSelectedPackage(packageId);
    };

    const handleToggleAddon = (addonId: number) => {
        setSelectedAddons(prev =>
            prev.includes(addonId)
                ? prev.filter(id => id !== addonId)
                : [...prev, addonId]
        );
    };

    const currentPackage = packages.find(p => p.Id === selectedPackage);
    const enabledAddons = currentPackage?.Addons.filter(addon => addon.IsEnabled) || [];

    const selectedAddonDetails = enabledAddons.filter(addon => selectedAddons.includes(addon.Id));

    const packagePrice = currentPackage?.Price ?? 0;

    const packageActualPrice = currentPackage?.ActualPrice ?? 0;

    const addonsPrice = enabledAddons
        .filter(addon => selectedAddons.includes(addon.Id))
        .reduce((total, addon) => total + (packagePrice * addon.PackagePriceIncreasePercentage) / 100, 0);

    const addonsActualPrice = enabledAddons
        .filter(addon => selectedAddons.includes(addon.Id))
        .reduce((total, addon) => total + ((packageActualPrice > 0 ? packageActualPrice : packagePrice) * addon.PackagePriceIncreasePercentage) / 100, 0);

    const totalPrice = packagePrice + addonsPrice;
    const totalActualPrice = (packageActualPrice > 0 ? packageActualPrice : packagePrice) + addonsActualPrice;

    const stepContent = [
        <SelectPackageContent key="package" packages={packages as Package[]} selectedPackage={selectedPackage} onSelectPackage={handleSelectPackage} />,
        <ChooseAddonsContent key="addons" addons={enabledAddons} selectedAddons={selectedAddons} onToggleAddon={handleToggleAddon} packagePrice={currentPackage?.Price ?? 0} />,
        <CompletePurchaseContent key="purchase" selectedPaymentMethod={selectedPaymentMethod} onSelectPaymentMethod={setSelectedPaymentMethod} totalPrice={totalPrice} totalActualPrice={totalActualPrice} currentPackage={currentPackage} selectedAddonDetails={selectedAddonDetails} setOrderDetailsVisible={setOrderDetailsVisible} />,
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            <aside className="w-[320px] bg-[#08a9c1] p-6 text-white">
                <div className="px-4 mb-8">
                    <Image src="/logo.svg" alt="Logo" width={224} height={60} priority={true} />
                </div>
                <nav>
                    <ul className="space-y-2">
                        {steps.map((step, index) => (
                            <li key={step}>
                                <button
                                    onClick={() => index < activeStep && setActiveStep(index)}
                                    disabled={index > activeStep}
                                    className={`w-full text-left rounded-md px-4 py-2 font-['Poppins',_Roboto,_sans-serif] transition-colors disabled:cursor-default disabled:opacity-50 ${index <= activeStep
                                        ? "bg-[url(/arrow_in_circle.svg)] bg-left bg-no-repeat pl-10 text-[20px] font-medium cursor-pointer"
                                        : "text-[16px] text-black pl-10"
                                        }`}
                                >
                                    {step}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="w-full h-[100px] bg-white flex items-center justify-between px-8">
                    <h2 className="text-[35px] font-medium font-['Poppins',_Roboto,_sans-serif] text-gray-800">
                        {steps[activeStep]}
                    </h2>
                    <button
                        onClick={onBack}
                        className="rounded-lg bg-[#f3f7ff] px-4 py-2 text-sm font-semibold text-[#0ca8c1] shadow-md transition-colors hover:bg-[#e4eaf2]"
                    >
                        Back to platform
                    </button>
                </header>
                <div className="flex-1 flex flex-col overflow-hidden bg-white">
                    <div className="flex-1 p-6 py-0 overflow-y-auto">
                        {stepContent[activeStep]}
                    </div>
                    <footer className="bg-white p-4 border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                        <div className="flex justify-between items-center">
                            {!(activeStep === 2 && isOrderDetailsVisible) ? (
                                <div>
                                    <span className="text-black font-semibold text-xl">Total:</span>
                                    <span className="ml-2 text-xl font-bold text-gray-800">
                                        {formatPrice(totalPrice)}
                                    </span>
                                </div>
                            ) : (
                                <div />
                            )}
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={handleBack}
                                    disabled={activeStep === 0 || activeStep === steps.length - 1}
                                    className="flex items-center justify-center h-[52px] px-6 font-['Poppins',_Roboto,_sans-serif] text-[18px] text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 disabled:hidden"
                                >
                                    <Image
                                        src="/chevron-left.svg"
                                        alt="Back"
                                        width={10}
                                        height={17}
                                        className="mr-2 filter-invert"
                                    />
                                    Back
                                </button>
                                <button
                                    onClick={activeStep === steps.length - 1 ? () => alert("Purchase complete!") : handleNext}
                                    disabled={(activeStep === 0 && selectedPackage === null) || (activeStep === steps.length - 1 && selectedPaymentMethod === null)}
                                    className="h-[52px] px-6 font-['Poppins',_Roboto,_sans-serif] text-[18px] text-white bg-[#08a9c1] rounded-full hover:bg-[#0798ab] disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {activeStep === steps.length - 1 ? "Purchase" : "Continue"}
                                </button>
                            </div>
                        </div>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default MultistepCheckout;