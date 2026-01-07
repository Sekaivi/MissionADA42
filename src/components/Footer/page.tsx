import React from 'react';

export default function Footer() {
    return (
        <footer className="mt-10 bg-gray-900 py-6 text-gray-300">
            <div className="bouton">
                <p className="text-sm">
                    © {new Date().getFullYear()} MonSite — Tous droits réservés.
                </p>
            </div>
        </footer>
    );
}
