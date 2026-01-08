'use client';

import React, { useState } from 'react';

// 1. CONFIGURATION DES IMAGES (Facile à modifier)
const GAME_ASSETS = {
    nyan: "/images/idePuzzle/nyan-cat-cat.gif",
    banner: "/images/idePuzzle/webdesignerparadise.gif",
    nerd: "/images/idePuzzle/nerd.gif",
    cool: "/images/idePuzzle/cool.png",
    sparkles: "/images/idePuzzle/sparkles.gif",
    trash: "/images/idePuzzle/trash.gif",
    notSupported: "/images/idePuzzle/notsupported.png",
    htmlClinic: "/images/idePuzzle/htmlclinic.gif",
    finalImg: "/images/idePuzzle/iut1_image.jpg",
    smiley: "/images/idePuzzle/smiley_lg_clr.gif"
};

// 2. CONFIGURATION DES RÉPONSES ATTENDUES
const CORRECT_ANSWERS = {
    nyan: ["none"],
    h1Color: ["black", "noir", "#000000"],
    pSize: ["12px"],
    bg: ["white", "#ffffff"],
    zIndex: ["-1"],
    marquee: ["none", "paused"]
};

export default function DesignPuzzle() {
    const [inputs, setInputs] = useState({
        nyan: '',
        h1Color: '',
        pSize: '',
        bg: '',
        zIndex: '',
        marquee: ''
    });

    const [isComplete, setIsComplete] = useState(false);
    const [message, setMessage] = useState("Vous êtes plutôt créatifs en MMI non ? Alors arrangez moi tout ça. Si vous aimez rigolez, croyez moi qu’on va rigoler");

    const handleApplyCode = () => {
        let successCount = 0;

        if (CORRECT_ANSWERS.nyan.includes(inputs.nyan.toLowerCase().trim())) successCount++;
        if (CORRECT_ANSWERS.h1Color.includes(inputs.h1Color.toLowerCase().trim())) successCount++;
        if (CORRECT_ANSWERS.pSize.includes(inputs.pSize.trim())) successCount++;
        if (CORRECT_ANSWERS.bg.includes(inputs.bg.toLowerCase().trim())) successCount++;
        if (CORRECT_ANSWERS.zIndex.includes(inputs.zIndex.trim())) successCount++;
        if (CORRECT_ANSWERS.marquee.includes(inputs.marquee.toLowerCase().trim())) successCount++;

        if (successCount === 6) {
            setIsComplete(true);
            setMessage("Incroyable. On dirait presque un vrai site. C'est presque décevant.");
        } else if (successCount > 0) {
            setMessage("C'est un début... mais c'est pas encore fini.");
        } else {
            setMessage("Mdr bande de nullos, vous n'avez rien changé du tout !");
        }
    };

    return (
        <div className="puzzle-wrapper">
            {/* MESSAGE ANOM */}
            <div className="msg-harrydler">
                <p className="sender-msg">Anom</p>
                <p id="content-msg">{message}</p>
            </div>

            {/* LE SITE "MOCHE" */}
            <section id="fake-website" style={{ backgroundColor: isComplete ? '#f0f0f0' : '' }}>
                <div className="fake-nav-bar">
                    <span className="close"></span>
                    <span className="minimize"></span>
                    <span className="resize"></span>
                </div>

                <div className={`fake-website-background ${isComplete ? 'final-bg' : ''}`}>
                    <div className={`fake-website-content ${isComplete ? 'final-transformation' : ''}`} 
                         style={{ backgroundColor: !isComplete ? '' : 'white' }}>
                        
                        {/* NYAN CAT */}
                        {!isComplete && inputs.nyan !== 'none' && (
                            <img id="nyan-cat" src={GAME_ASSETS.nyan} alt="nyan" />
                        )}

                        <div className="image-covering-content">
                            <div className="image-covering-container" style={{ zIndex: isComplete ? -1 : parseInt(inputs.zIndex) || 0 }}>
                                <img style={{ position: "relative" }} src={GAME_ASSETS.banner} alt="gif banner" />
                            </div>
                            <h1 style={{ 
                                color: !isComplete && inputs.h1Color ? inputs.h1Color : '',
                                backgroundColor: isComplete ? 'transparent' : '',
                                boxShadow: isComplete ? 'none' : ''
                            }}>
                                {isComplete ? "Bienvenue au sein de l'IUT1 de l'Université Grenoble Alpes" : "Bienvenu o sin de lIUT1 de luniversiter grenobles alpe"}
                            </h1>
                        </div>

                        {!isComplete && (
                            <div className="marquee-container">
                                <div className="marquee-content" style={{ animation: inputs.marquee === 'none' ? 'none' : '' }}>
                                    (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ NOUVELLES EXCITANTES ! ★彡 DÉCOUVREZ NOS DERNIÈRES MISES À J...
                                </div>
                            </div>
                        )}

                        <div id="nerd-text">
                            <img src={GAME_ASSETS.nerd} alt="nerd" />
                            <p className="fake-site-cursive">J’aime tro le dev !!</p>
                        </div>

                        {!isComplete && <h1 id="super-site-p">Mon super site</h1>}

                        <p id="fake-bloc-text" style={{ 
                            fontSize: !isComplete && inputs.pSize ? inputs.pSize : '',
                            borderImage: isComplete ? 'none' : '',
                            borderColor: isComplete ? '#ccc' : ''
                        }}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eget lacus ac quam imperdiet faucibus.
                        </p>

                        {!isComplete && (
                            <div id="fake-website-grid-images">
                                <img src={GAME_ASSETS.cool} id="fake-web-cool" alt="cool" />
                                <div id="fake-web-trash">
                                    <div id="etudiants-mmi"><p>Les étudiants en MMI</p></div>
                                    <img id="fake-web-sparkles" src={GAME_ASSETS.sparkles} />
                                    <img src={GAME_ASSETS.trash} />
                                </div>
                            </div>
                        )}

                        <p className="fake-website-default-ugly-text">Ceci n'est pas un lien</p>

                        <div className="image-covering-content">
                            <div className="image-covering-container" style={{ zIndex: isComplete ? -1 : parseInt(inputs.zIndex) || 0 }}>
                                <img src={GAME_ASSETS.smiley} alt="smiley" />
                            </div>
                            <p className="blinking-text">{isComplete ? "Éléments HTML désuets" : "Top 3 éléments html"}</p>
                            <ul>
                                <li>strike</li>
                                <li>xmp</li>
                                <li>basefont</li>
                            </ul>
                        </div>

                        {/* ZONE FINALE / IFRAME */}
                        <div id="fake-iframe">
                            {!isComplete ? (
                                <>
                                    <h2>504 Gateway Time-out</h2>
                                    <hr />
                                    <p>nginx/1.4.6 (Ubuntu)</p>
                                </>
                            ) : (
                                <>
                                    <img id="finalImg" src={GAME_ASSETS.finalImg} alt="IUT1 Clean" />
                                    <button className="next-step-button" onClick={() => alert('Étape suivante !')}>
                                        Étape suivante
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* IDE */}
            {!isComplete && (
                <section id="IDE">
                    <div className="ide-container">
                        <div className="ide-header">style.css — Editeur</div>
                        <div className="ide-code">
                            <span className="comment">/* 1. Virer le chat */</span><br/>
                            #nyan-cat {'{'} display: <input type="text" value={inputs.nyan} onChange={e => setInputs({...inputs, nyan: e.target.value})} placeholder="--" /> ; {'}'}<br/><br/>
                            
                            <span className="comment">/* 2. Uniformiser titres */</span><br/>
                            h1 {'{'} color: <input type="text" value={inputs.h1Color} onChange={e => setInputs({...inputs, h1Color: e.target.value})} placeholder="blue" /> ; {'}'}<br/><br/>

                            <span className="comment">/* 3. Taille texte */</span><br/>
                            p {'{'} font-size: <input type="text" value={inputs.pSize} onChange={e => setInputs({...inputs, pSize: e.target.value})} placeholder="16px" /> ; {'}'}<br/><br/>

                            <span className="comment">/* 4. Fond site */</span><br/>
                            .content {'{'} background-color: <input type="text" value={inputs.bg} onChange={e => setInputs({...inputs, bg: e.target.value})} placeholder="cyan" /> ; {'}'}<br/><br/>

                            <span className="comment">/* 5. Profondeur */</span><br/>
                            .container {'{'} z-index: <input type="number" value={inputs.zIndex} onChange={e => setInputs({...inputs, zIndex: e.target.value})} placeholder="999" /> ; {'}'}<br/><br/>

                            <span className="comment">/* 6. Stop scroll */</span><br/>
                            .marquee {'{'} animation: <input type="text" value={inputs.marquee} onChange={e => setInputs({...inputs, marquee: e.target.value})} placeholder="--" /> ; {'}'}
                        </div>
                        <button id="apply-code" onClick={handleApplyCode}>Exécuter la mise à jour</button>
                    </div>
                </section>
            )}

            <style jsx>{`
                @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300..800&family=Festive&display=swap');

                .puzzle-wrapper { font-family: "Open Sans", sans-serif; padding: 2rem; display: flex; flex-direction: column; gap: 1rem; }
                
                /* STYLE EXACT DU MESSAGE */
                .msg-harrydler { background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-left: 8px solid #af7cff; border-radius: 8px; padding: 15px 20px; max-width: 300px; }
                .sender-msg { font-weight: bold; font-size: 1.2rem; }

                /* STYLE EXACT DU SITE MOCHE */
                #fake-website { border: 1px solid #343a40; border-radius: 16px; background-color: cyan; }
                .fake-nav-bar { background: #343a40; display: flex; gap: 16px; padding: 0.5rem; border-radius: 16px 16px 0 0; }
                .fake-nav-bar span { height: 25px; width: 25px; border-radius: 50%; box-shadow: inset 0 2px 0 rgba(255,255,255,0.5); }
                .close { background: red; } .minimize { background: orange; } .resize { background: green; }

                .fake-website-background { 
                    padding: 1rem; 
                    background-image: linear-gradient(to bottom, rgba(255,0,0,0.6), rgba(255,255,0,0.6), rgba(0,0,255,0.6)), url("iut1_image.jpg");
                    background-size: 100% 100%, 25rem;
                }
                .final-bg { background-image: none !important; background-color: #f0f0f0 !important; }

                .fake-website-content { 
                    padding: 1rem; background-color: #00C8FF; display: flex; flex-direction: column; gap: 1rem; align-items: center; position: relative;
                }

                .fake-website-content h1 { 
                    color: red; background: #00FF15; padding: 1rem; box-shadow: inset 10px 10px 6px rgba(255,255,255,0.5); border-radius: 20%; font-family: "Comic Sans MS", cursive;
                }

                #super-site-p {
                    color: #FF00CC; text-shadow: 0px 8px 0px #FF0000; font-size: 2rem;
                    background: linear-gradient(45deg, #ff0000, #ffff00, #0000ff);
                    animation: superSitePAnim 1s steps(2) infinite alternate;
                    border: 4px solid red;
                }

                #fake-bloc-text { 
                    font-family: 'Times New Roman'; padding: 1rem; color: #FF00D0;
                    border: 2px solid transparent;
                    border-image: conic-gradient(from 0deg, #FF21AE, #FFE100, #FF21AE) 1;
                }

                #nyan-cat { position: absolute; top: 0; left: 0; width: 20rem; z-index: 10; }

                .marquee-container { background: red; width: 100%; overflow: hidden; color: white; padding: 10px 0; }
                .marquee-content { display: inline-block; animation: marquee-animation 15s linear infinite; white-space: nowrap; }

                .blinking-text { animation: blinkingTextAnim 0.5s steps(2) infinite alternate; color: blue; font-weight: bold; }

                #fake-iframe { background: white; padding: 1rem; min-width: 80%; border: 1px solid gray; text-align: center; position: relative; }

                /* IDE STYLE */
                .ide-container { background: #1e1e1e; color: #d4d4d4; padding: 20px; border-radius: 8px; font-family: monospace; }
                .comment { color: #6a9955; }
                .ide-code input { background: transparent; border: none; border-bottom: 1px dashed #666; color: #ce9178; width: 80px; outline: none; }
                #apply-code { margin-top: 20px; background: #007acc; color: white; padding: 10px; border: none; cursor: pointer; width: 100%; }

                /* ANIMATIONS EXACTES */
                @keyframes superSitePAnim { 
                    0% { text-shadow: none; } 
                    100% { text-shadow: 0px 8px 0px #FF0000, 0px 16px 0px #00C8FF; } 
                }
                @keyframes marquee-animation { from { transform: translateX(100%); } to { transform: translateX(-100%); } }
                @keyframes blinkingTextAnim { from { color: red; } to { color: #00FF15; } }
                
                #fake-web-cool { animation: shakyImage 0.3s infinite; }
                @keyframes shakyImage {
                    0%, 100% { transform: translate(0,0); }
                    25% { transform: translate(-1px, 1px); }
                    75% { transform: translate(1px, -1px); }
                }

                .next-step-button {
                    background: #af7cff; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold;
                    cursor: pointer; margin-top: 20px;
                }
                
                .final-transformation { transition: all 1s ease; gap: 0.5rem !important; }
            `}</style>
        </div>
    );
}