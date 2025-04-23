import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function EditProfile() {
    return (
        <>
        <Header />
        <div className="grid grid-cols-5 grid-rows-5 gap-1">
            <div className="row-span-5">
                <p className="text-black">
                    Tutorial
                </p>
            </div>
        </div>
        <Footer />
        </>
    )
}