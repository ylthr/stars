const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

const keys = {};

addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

function mapPerspectiveToScreen(point3D) { 
    return { x: (point3D.x * (1000 / point3D.z)) + windowWidth / 2, y: (point3D.y * (1000 / point3D.z)) + windowHeight / 2 };
}

console.log("fov: " + Math.atan((windowWidth / 2) / 1000) * 2 * (180 / Math.PI))

function rotatePointRelativeToCamera(point3D, pitchAngle, yawAngle, rollAngle) {
    pitchAngle = (Math.PI / 180) * pitchAngle;
    yawAngle = (Math.PI / 180) * yawAngle;
    rollAngle = (Math.PI / 180) * rollAngle;
    
    const pointWithPitchTransformation = {
        x: point3D.x,
        y: Math.cos(pitchAngle) * point3D.y - Math.sin(pitchAngle) * point3D.z,
        z: Math.sin(pitchAngle) * point3D.y + Math.cos(pitchAngle) * point3D.z
    };

    const pointWithYawTransformation = {
        x: Math.cos(yawAngle) * pointWithPitchTransformation.x + Math.sin(yawAngle) * pointWithPitchTransformation.z,
        y: pointWithPitchTransformation.y,
        z: -Math.sin(yawAngle) * pointWithPitchTransformation.x + Math.cos(yawAngle) * pointWithPitchTransformation.z
    };

    const pointWithRollTransformation = {
        x: Math.cos(rollAngle) * pointWithYawTransformation.x - Math.sin(rollAngle) * pointWithYawTransformation.y,
        y: Math.sin(rollAngle) * pointWithYawTransformation.x + Math.cos(rollAngle) * pointWithYawTransformation.y,
        z: pointWithYawTransformation.z,
    };

    return {
        ...pointWithRollTransformation
    }
}

function createStarPool() {
    return Array.from(new Array(100000)).map(_ => {
        return {
            coordinates: {
                x: Number(Math.random() * 5000 - 2500),
                y: Number(Math.random() * 5000 - 2500),
                z: Number(Math.random() * 10000),
            },
            size: Number(Math.random() * 1000) + 10,
            color: Math.round(Math.random() * 100) == 50 ? "yellow" : "yellow"
        }
    });
}

function startAnimation(canvas) {
    const canvasContext = canvas.getContext("2d", {
        antialias: false,
        depth: false,
    });

    const starPool = createStarPool();
    
    // reference point
    starPool.push({
        coordinates: {
            x: 0,
            z: 0,
            y: 100,
        },
        size: 10000,
        color: "white"
    });

    let pitchAngle = 0;
    let yawAngle = 0;
    let rollAngle = 0;

    const frameIteration = () => {
        canvasContext.fillStyle = "rgba(0 0 0 / 100%)";
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);

        pitchAngle += keys["w"] ? 1 : keys["s"] ? -1 : 0
        yawAngle += keys["d"] ? 1 : keys["a"] ? -1 : 0
        rollAngle += keys["q"] ? 1 : keys["e"] ? -1 : 0

        starPool.forEach(star => {
            if (star.color != "white")
                star.coordinates.z -= 2;
            
            const transformedStarCoordinates = rotatePointRelativeToCamera(star.coordinates, pitchAngle, yawAngle, rollAngle);
            const screenCoordinates = mapPerspectiveToScreen(transformedStarCoordinates); 

            if (star.coordinates.z <= -10000) {
                star.coordinates.z = 10000;
                return;
            }

            if (transformedStarCoordinates.z >= 3000 || transformedStarCoordinates.z <= 1) {
                return;
            }

            canvasContext.fillStyle = star.color;
            canvasContext.fillRect(screenCoordinates.x, screenCoordinates.y, star.size / transformedStarCoordinates.z, star.size / transformedStarCoordinates.z);
        });

        window.requestAnimationFrame(frameIteration);
    };

    window.requestAnimationFrame(frameIteration);
}

window.onload = () => {
    const canvas = document.getElementById("canvas");
    const canvasContext = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvasContext.fillStyle = "rgb (0 0 0 / 40%)";

    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    startAnimation(canvas);
}
