const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

const keys = {};

addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

function calculateFocalLengthFromFov(fov) {
    return (windowWidth / 2) * Math.tan((Math.PI / 180) * fov / 2) * 2;
}

function mapPerspectiveToScreen(point3D, focalLength) { 
    return { x: (point3D.x * (-focalLength / point3D.z)) + windowWidth / 2, y: (point3D.y * (-focalLength / point3D.z)) + windowHeight / 2 };
}

console.log("fov: " + Math.atan((windowWidth / 2) / 1000) * 2 * (180 / Math.PI))

const rotateYaw = (point3D, yawAngle) => ({
    x: Math.cos(yawAngle) * point3D.x + Math.sin(yawAngle) * point3D.z,
    y: point3D.y,
    z: -Math.sin(yawAngle) * point3D.x + Math.cos(yawAngle) * point3D.z
});

const rotatePitch = (point3D, pitchAngle) => ({
    x: point3D.x,
    y: Math.cos(pitchAngle) * point3D.y - Math.sin(pitchAngle) * point3D.z,
    z: Math.sin(pitchAngle) * point3D.y + Math.cos(pitchAngle) * point3D.z
});

const rotateRoll = (point3D, rollAngle) => ({
    x: Math.cos(rollAngle) * point3D.x - Math.sin(rollAngle) * point3D.y,
    y: Math.sin(rollAngle) * point3D.x + Math.cos(rollAngle) * point3D.y,
    z: point3D.z,
});

function rotatePointRelativeToCamera(point3D, pitchAngle, yawAngle, rollAngle) {
    pitchAngle = (Math.PI / 180) * pitchAngle;
    yawAngle = (Math.PI / 180) * yawAngle;
    rollAngle = (Math.PI / 180) * rollAngle;
    
    const pointWithYawTransformation = rotateYaw(point3D, yawAngle);
    const pointWithPitchTransformation = rotatePitch(pointWithYawTransformation, pitchAngle);
    const pointWithRollTransformation = rotateRoll(pointWithPitchTransformation, rollAngle);

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

    addEventListener("mousemove", (event) => {
        pitchAngle = Math.min(Math.max(-event.movementY * 0.1 + pitchAngle, -90), 90);
        yawAngle = event.movementX * 0.1 + yawAngle;
    });

    const frameIteration = () => {
        canvasContext.fillStyle = "rgba(0 0 0 / 100%)";
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);

        rollAngle = (keys["q"] ? 1 : keys["e"] ? -1 : 0) + rollAngle

        const focalLength = calculateFocalLengthFromFov(document.getElementById("fovRange").value);

        starPool.forEach(star => {
            if (star.color != "white")
                star.coordinates.z -= 2;
            
            const transformedStarCoordinates = rotatePointRelativeToCamera(star.coordinates, pitchAngle, yawAngle, rollAngle);
            const screenCoordinates = mapPerspectiveToScreen(transformedStarCoordinates, focalLength); 

            if (star.coordinates.z <= -10000) {
                star.coordinates.z = 10000;
                return;
            }

            if (transformedStarCoordinates.z >= 3000 || transformedStarCoordinates.z <= 1 || screenCoordinates.x >= 1920 || screenCoordinates.x <= 0 || screenCoordinates.y >= 1080 || screenCoordinates.y <= 1) {
                return;
            }

            const starSizeOnScreen = star.size / transformedStarCoordinates.z;
            
            canvasContext.fillStyle = star.color;
            canvasContext.fillRect(screenCoordinates.x - starSizeOnScreen / 2, screenCoordinates.y - starSizeOnScreen / 2, starSizeOnScreen, starSizeOnScreen);
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
