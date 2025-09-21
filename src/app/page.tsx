"use client";

import { useState } from "react";
import { MultistepCheckout } from "./multistep-checkout/page";

const HomePageContent = ({
    setCurrentPage,
}: {
    setCurrentPage: (page: string) => void;
}) => (
    <div className="flex flex-col items-center justify-center p-8 min-h-screen bg-gray-100 text-gray-800">
        <div className="max-w-xl w-full p-8 bg-white rounded-xl shadow-lg">
            <h1 className="text-4xl font-extrabold mb-6 text-center text-gray-900">
                App Directory
            </h1>
            <p className="text-center text-gray-600 mb-8">
                Select a page to view its layout.
            </p>
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => setCurrentPage("checkout")}
                    className="w-full py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
                >
                    Multistep Checkout
                </button>
                <div className="text-sm text-gray-400 mt-4 text-center">
                    More pages can be added here.
                </div>
            </div>
        </div>
    </div>
);

export default function Home() {
    const [currentPage, setCurrentPage] = useState("home");

    switch (currentPage) {
        case "checkout":
            return <MultistepCheckout onBack={() => setCurrentPage("home")} />;
        case "home":
        default:
            return <HomePageContent setCurrentPage={setCurrentPage} />;
    }
}