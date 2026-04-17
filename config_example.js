module.exports = {
    STEAM_API_KEY: "YOUR_STEAM_API_KEY",
    DISCORD_WEBHOOK: "https://discord.com/api/webhooks/YOUR_WEBHOOK_URL",
    INTERVAL_SECONDS: 60,
    ITEM_COUNT: 100,

    // 1=USD  2=GBP  3=EUR  5=RUB  7=BRL  8=JPY  9=NOK  10=IDR
    // 11=MYR  12=PHP  13=SGD  14=THB  18=KRW  20=CAD  21=MXN  22=AUD  23=NZD  24=CNY  25=INR
    CURRENCY: 1,

    // Discord IDs to ping (OPTIONAL)
    PING_USERS: [
        "123456789012345678",
        "987654321098765432",
    ],

    ITEMS: [
        {
            name: "StatTrak™ SCAR-20 | Poultrygeist (Minimal Wear)",
            appId: 730,
            maxPrice: 0.5,
            maxFloat: 0.13,
        },
        {
            name: "AK-47 | Redline (Field-Tested)",
            appId: 730,
            maxPrice: 20.00,
            maxFloat: 0.20,
        },
    ]
};