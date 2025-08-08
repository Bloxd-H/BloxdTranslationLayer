const Float = Java.type("java.lang.Float");
const Vec3d = Java.type("net.minecraft.util.math.Vec3d");
const Timer = Java.type("net.ccbluex.liquidbounce.utils.client.Timer").INSTANCE;
const Priority = Java.type("net.ccbluex.liquidbounce.utils.kotlin.Priority");
const PayloadNetworking = Java.type("net.fabricmc.fabric.api.networking.v1.PayloadTypeRegistry");
const FakePayload = Java.type("net.minecraft.network.packet.UnknownCustomPayload");
const Payload = Java.type("net.minecraft.network.packet.CustomPayload");
const Identifier = Java.type("net.minecraft.util.Identifier");

const DELTA = 1 / 30;
const JUMP_MOTION = 0.41999998688697815;
const FLY_DURATION = 1300;

const script = registerScript({
    name: "BloxdPhysics+",
    version: "1.0.7",
    authors: ["7GrandDad", "ChatGPT","Zerole"]
});

let bhopJumps = 0;
let groundTicks = 0;
let canSpider = false;
let wasClimbing = false;
let flyUntil = 0;

class BloxdPhysicsBody {
    impulseVector = new Vec3d(0, 0, 0)
    forceVector = new Vec3d(0, 0, 0)
    velocityVector = new Vec3d(0, 0, 0)
    gravityVector = new Vec3d(0, -10, 0)
    gravityMul = 2
    mass = 1
    getMotionForTick() {
        const massDiv = 1 / this.mass;
        this.forceVector = this.forceVector.multiply(massDiv).add(this.gravityVector).multiply(this.gravityMul).multiply(DELTA);
        this.impulseVector = this.impulseVector.multiply(massDiv).add(this.forceVector);
        this.velocityVector = this.velocityVector.add(this.impulseVector);
        this.forceVector = new Vec3d(0, 0, 0);
        this.impulseVector = new Vec3d(0, 0, 0);
        return this.velocityVector;
    }
}

class CustomPayload {
    ID = new Payload.Id(Identifier.of("bloxd", "resyncphysics"));
    CODEC = Payload.codecOf(() => {}, (buf) => this.read(buf));
    read(data) {
        localStorage.resyncVelocity(data.readFloat(), data.readFloat(), data.readFloat());
        return new FakePayload(this.ID.id());
    }
    getId() {
        return this.ID;
    }
}

script.registerModule({
    name: "BloxdSpider",
    category: "Movement",
    description: "Climb up walls for Bloxd.",
    settings: {}
}, (mod) => {
    mod.on("enable", () => canSpider = true);
    mod.on("disable", () => canSpider = false);
});

script.registerModule({
    name: "BloxdPhysics",
    category: "Movement",
    description: "Adjusts the falling physics for Bloxd.",
    settings: {
        timer: Setting.boolean({ name: "Timer", default: true })
    }
}, (mod) => {
    const pBody = new BloxdPhysicsBody();

    try {
        const payload = new CustomPayload();
        PayloadNetworking.playS2C().register(payload.ID, payload.CODEC);
    } catch {}

    localStorage.resyncVelocity = function(x, y, z) {
        bhopJumps = 0;
        pBody.impulseVector = new Vec3d(0, 0, 0);
        pBody.forceVector = new Vec3d(0, 0, 0);
        pBody.velocityVector = new Vec3d(x, y, z);
    }

    mod.on("gameTick", () => {
        if (mod.settings.timer.value) {
            Timer.requestTimerSpeed(Float.valueOf("1.5"), Priority.NORMAL, mod, 1);
        }
    });

    mod.on("playerStrafe", (event) => {
        if (Date.now() < flyUntil) return;

        if (mc.player.groundCollision && pBody.velocityVector.y < 0)
            pBody.velocityVector = new Vec3d(0, 0, 0);

        if (mc.player.groundCollision && mc.player.getVelocity().y == JUMP_MOTION) {
            bhopJumps = Math.min(bhopJumps + 1, 3);
            pBody.impulseVector = pBody.impulseVector.add(new Vec3d(0, 8, 0));
        }

        if (canSpider) {
            if (mc.player.horizontalCollision && event.movementInput.length() > 0) {
                pBody.velocityVector = new Vec3d(0, 8, 0);
                wasClimbing = true;
            } else if (wasClimbing) {
                pBody.velocityVector = new Vec3d(0, 0, 0);
                wasClimbing = false;
            }
        }

        groundTicks = mc.player.groundCollision ? groundTicks + 1 : 0;
        if (groundTicks > 5) bhopJumps = 0;

        event.movementInput = new Vec3d(0, 0, 0);
        event.velocity = new Vec3d(0, 0, 0);
        event.speed = 0;

        mc.player.setVelocity(
            0,
            (mc.world.isPosLoaded(mc.player.getSteppingPos()) || mc.player.getPos().y <= 0)
                ? pBody.getMotionForTick().y * DELTA
                : 0,
            0
        );

        MovementUtil.strafeWithSpeed(mc.player.isUsingItem() ? 0.06 : 0.26 + 0.025 * bhopJumps);
    });
});

script.registerModule({
    name: "DamageFly",
    category: "Movement",
    description: "Allows temporary flight after taking knockback.",
    settings: {
        horizontalSpeed: Setting.float({ name: "Horizontal Speed", default: 2.0, range: [0, 4.0], step: 0.1 }),
        verticalSpeed: Setting.float({ name: "Vertical Speed", default: 0.3, range: [0, 3.0], step: 0.1 })
    }
}, (mod) => {
    mod.on("packet", (event) => {
        if (event.packet.getPacketType().id().path == "set_entity_motion") {
            if (event.packet.getEntityId() == mc.player.getId()) {
                flyUntil = Date.now() + FLY_DURATION;
            }
        }
    });

    mod.on("playerStrafe", (event) => {
        const isFlying = Date.now() < flyUntil;
        if (!isFlying) return;

        event.movementInput = new Vec3d(0, 0, 0);
        event.velocity = new Vec3d(0, 0, 0);
        event.speed = 0;

        const yaw = mc.player.getYaw() * Math.PI / 180;
        let vertical = 0;
        let move = new Vec3d(0, 0, 0);

        if (mc.options.forwardKey.isPressed())
            move = move.add(new Vec3d(-Math.sin(yaw), 0, Math.cos(yaw)));
        if (mc.options.backKey.isPressed())
            move = move.add(new Vec3d(Math.sin(yaw), 0, -Math.cos(yaw)));
        if (mc.options.leftKey.isPressed())
            move = move.add(new Vec3d(Math.cos(yaw), 0, Math.sin(yaw)));
        if (mc.options.rightKey.isPressed())
            move = move.add(new Vec3d(-Math.cos(yaw), 0, -Math.sin(yaw)));

        if (move.length() > 0)
            move = move.normalize().multiply(mod.settings.horizontalSpeed.value);

        if (mc.options.jumpKey.isPressed()) vertical += mod.settings.verticalSpeed.value;
        if (mc.options.sneakKey.isPressed()) vertical -= mod.settings.verticalSpeed.value;

        mc.player.setVelocity(move.x, vertical, move.z);
    });
});
