window.addEventListener("load", function () {
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d", {
        willReadFrequently: true,
    });

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
        constructor(effect, x, y, color) {
            this.effect = effect;
            this.x = Math.random() * this.effect.canvasWidth;
            this.y = 0;
            this.color = color;
            this.originX = x;
            this.originY = y;
            this.size = this.effect.gap;

            this.dx = 0;
            this.dy = 0;
            this.vx = 0;
            this.vy = 0;
            this.force = 0;
            this.angle = 0;
            this.distance = 0;
            this.friction = Math.random() * 0.6 + 0.15;
            this.ease = Math.random() * 0.1 + 0.005;
        }

        draw() {
            this.effect.context.fillStyle = this.color;
            this.effect.context.fillRect(this.x, this.y, this.size, this.size);
        }

        update() {
            this.dx = this.effect.mouse.x - this.x;
            this.dy = this.effect.mouse.y - this.y;
            this.distance = this.dx * this.dx + this.dy * this.dy;
            this.force = -this.effect.mouse.radius / this.distance;

            if (this.distance < this.effect.mouse.radius) {
                this.angle = Math.atan2(this.dy, this.dx);
                this.vx += this.force * Math.cos(this.angle);
                this.vy += this.force * Math.sin(this.angle);
            }

            this.x +=
                (this.vx *= this.friction) +
                (this.originX - this.x) * this.ease;
            this.y +=
                (this.vy *= this.friction) +
                (this.originY - this.y) * this.ease;
        }
    }

    class Effect {
        constructor(context, canvasWidth, canvasHeight) {
            this.context = context;
            this.canvasWidth = canvasWidth;
            this.canvasHeight = canvasHeight;

            this.textX = this.canvasWidth / 2;
            this.textY = this.canvasHeight / 2;

            this.fontSize = 80;
            this.lineHeight = this.fontSize;

            this.maxTextWidth = this.canvasWidth * 0.8;

            this.textInput = document.getElementById("textInput");
            this.textInput.addEventListener("keyup", (e) => {
                if (e.key != " ") {
                    this.context.clearRect(
                        0,
                        0,
                        this.canvasWidth,
                        this.canvasHeight
                    );
                    this.wrapText(e.target.value);
                }
            });

            // particle text
            this.particle = [];
            this.gap = 3;
            this.mouse = {
                radius: 20000,
                x: 0,
                y: 0,
            };

            window.addEventListener("mousemove", (e) => {
                this.mouse.x = e.x;
                this.mouse.y = e.y;
            });
        }

        wrapText(text) {
            // canvas settings
            const gradient = this.context.createLinearGradient(
                0,
                0,
                this.canvasWidth,
                this.canvasHeight
            );
            gradient.addColorStop(0.3, "red");
            gradient.addColorStop(0.5, "purple");
            gradient.addColorStop(0.7, "blue");

            this.context.fillStyle = gradient;
            this.context.font = this.fontSize + "px monospace";

            this.context.textAlign = "center";
            this.context.textBaseline = "middle";
            this.context.lineWidth = 2;
            this.context.strokeStyle = "white";

            // multiline break
            let linesArr = [];
            let lineCount = 0;
            let line = "";
            let words = text.split(" ");

            for (let i = 0; i < words.length; i++) {
                let word = words[i];
                let testLine = line + word + " ";

                if (
                    this.context.measureText(testLine).width > this.maxTextWidth
                ) {
                    line = word + " ";
                    lineCount++;
                } else {
                    line = testLine;
                }

                linesArr[lineCount] = line;
            }

            let textHeight = this.lineHeight * lineCount;
            let textY = this.canvasHeight / 2 - textHeight / 2;
            linesArr.forEach((el, index) => {
                this.context.fillText(
                    el,
                    this.canvasWidth / 2,
                    textY + index * this.lineHeight
                );
                this.context.strokeText(
                    el,
                    this.canvasWidth / 2,
                    textY + index * this.lineHeight
                );
            });
            this.convertToParticles();
        }

        convertToParticles() {
            this.particles = [];
            const pixels = this.context.getImageData(
                0,
                0,
                this.canvasWidth,
                this.canvasHeight
            ).data;
            this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            for (let y = 0; y < this.canvasHeight; y += this.gap) {
                for (let x = 0; x < this.canvasWidth; x += this.gap) {
                    const index = (y * this.canvasWidth + x) * 4;
                    const alpha = pixels[index + 3];
                    if (alpha == 0) {
                        continue;
                    }

                    const r = pixels[index + 0];
                    const g = pixels[index + 1];
                    const b = pixels[index + 2];
                    const color = `rgb(${r}, ${g}, ${b})`;

                    this.particles.push(new Particle(this, x, y, color));
                }
            }
        }

        render() {
            this.particles.forEach((p) => {
                p.update();
                p.draw();
            });
        }

        resize(width, height) {
            this.canvasWidth = width;
            this.canvasHeight = height;
            this.textX = this.canvasWidth / 2;
            this.textY = this.canvasHeight / 2;
            this.maxTextWidth = this.canvasWidth * 0.8;
        }
    }

    const effect = new Effect(ctx, canvas.width, canvas.height);
    effect.wrapText("This is Cool");

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        effect.render();
        requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        effect.resize(canvas.width, canvas.height);
        effect.wrapText("This is Cool");
    });

    /*
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = "red";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.strokeStyle = "green";
    ctx.stroke();
    */
});
