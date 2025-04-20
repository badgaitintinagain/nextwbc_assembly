import React from "react";

export default function EditProfile() {
    return (
        <div className="grid grid-cols-5 grid-rows-5 gap-1">
            <div className="row-span-5">
                <p className="text-black">Log</p>
            </div>
            <div className="col-span-3 row-span-5">
                <p className="text-black">Detail</p>
            </div>
            <div className="row-span-5 col-start-5">
                <p className="text-black">Statistics</p>
            </div>
        </div>
    )
}