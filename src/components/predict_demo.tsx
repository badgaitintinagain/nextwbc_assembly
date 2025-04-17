import React from "react";

const PredictDemo = () => {
    return (
        <div className="bg-white rounded-3xl shadow-md p-4 mt-8 px-4 max-w-xl mx-auto">
            <div className="grid grid-cols-2 grid-rows-2 gap-1">
                <div className="text-black flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 aspect-square">
                    <h1 className="text-center text-lg">
                        Upload Images Here
                    </h1>
                    <p className="text-center text-xs mb-3">
                        Up to 5 Image per 60 Minutes
                    </p>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition">
                        Upload
                    </button>
                </div>
                <div className="text-black col-start-1 row-start-2">
                    5
                </div>
                <div className="text-black row-span-2 col-start-2 row-start-1 col-span-2 flex items-center justify-center aspect-square border-dashed border-2 rounded-xl border-gray-200">
                    6 Merge 7
                </div>
            </div>
        </div>
    )
}

export default PredictDemo;
