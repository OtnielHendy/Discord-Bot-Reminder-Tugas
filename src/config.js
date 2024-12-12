module.exports = {
    client: {
        token: "Your Bot token (USE .env FOR SAFETY)",
        id: "Your Bot ID (USE .env FOR SAFETY)"
    },
    handler: {
        prefix: "Your Prefix (USE .env FOR SAFETY)",
        deploy: true,
        commands: {
            prefix: true,
            slash: true,
            user: true,
            message: true
        },
        mongodb: {
            uri: "Your MongoDB URI string (USE .env FOR SAFETY)",
            toggle: true
        }
    },
    users: {
        developers: ["1166731940477534212"]
    }
};
