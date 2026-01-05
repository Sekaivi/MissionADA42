import React from "react";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-6 mt-10">
            <div className="bouton">
                <p className="text-sm">© {new Date().getFullYear()} MonSite — Tous droits réservés.</p>
            </div>
        </footer>
    );
}