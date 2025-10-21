<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Trouvez du rouge</title>
    <style>
        video {
            width: 100%;
            max-width: 500px;
            border: 2px solid #333;
            border-radius: 8px;
        }
        #message {
            font-size: 1.5em;
            color: green;
            margin-top: 20px;
        }
    </style>
</head>
<body>
<h1>Trouvez du rouge !</h1>
<video id="cameraPreview" autoplay playsinline></video>
<div id="message"></div>
<canvas id="canvas" style="display:none;"></canvas>

<script>
    const video = document.getElementById('cameraPreview');
    const canvas = document.getElementById('canvas');
    const message = document.getElementById('message');
    const ctx = canvas.getContext('2d');

    async function startRearCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { exact: "environment" } },
                audio: false
            });
            video.srcObject = stream;
            video.addEventListener('play', detectRed);
        } catch (err) {
            console.error('Erreur accès caméra arrière :', err);
            alert('Impossible d’accéder à la caméra arrière. Vérifiez les permissions ou essayez un autre appareil.');
        }
    }

    function detectRed() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const checkFrame = () => {
            if (video.paused || video.ended) return;

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = frame.data;
            let redPixels = 0;

            for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];

                if (r > 150 && g < 100 && b < 100) {
                    redPixels++;
                }
            }

            const redRatio = redPixels / (pixels.length / 4);

            if (redRatio > 0.05) { // seuil : 5% des pixels
                message.textContent = "Rouge détecté !";
            } else {
                message.textContent = "";
            }

            requestAnimationFrame(checkFrame);
        };

        requestAnimationFrame(checkFrame);
    }

    startRearCamera();
</script>
</body>
</html>
