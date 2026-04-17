const config = require("./config");

function buildUrl(item) {
    const encoded = encodeURIComponent(item.name);
    return `https://steamcommunity.com/market/listings/${item.appId}/${encoded}/render/?start=0&count=${config.ITEM_COUNT}&currency=${config.CURRENCY}&format=json&key=${config.STEAM_API_KEY}`;
}

async function sendDiscordNotification(item, listing) {
    const iconUrl = listing.icon ?? null;

    const pingContent = config.PING_USERS?.length
        ? config.PING_USERS.map(id => `<@${id}>`).join(" ")
        : null;

    const payload = {
        ...(pingContent && { content: pingContent }),
        embeds: [
            {
                title: `🔔 Deal found: ${item.name}`,
                url: `https://steamcommunity.com/market/listings/${item.appId}/${encodeURIComponent(item.name)}`,
                color: 0x00ff99,
                thumbnail: iconUrl ? { url: iconUrl } : null,
                fields: [
                    { name: "💰 Price", value: `CA$${listing.price.toFixed(2)}`, inline: true },
                    { name: "📊 Float", value: listing.float?.toFixed(10) ?? "N/A", inline: true },
                ],
                timestamp: new Date().toISOString(),
            }
        ]
    };

    try {
        const res = await fetch(config.DISCORD_WEBHOOK, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const text = await res.text();
            console.error(`[Discord] Failed with status ${res.status}: ${text}`);
        } else {
            console.log(`[Discord] Notification sent for ${item.name} at CA$${listing.price.toFixed(2)}`);
        }
    } catch (err) {
        console.error(`[Discord] Failed to send notification:`, err.message);
    }
}

async function checkItem(item) {
    const url = buildUrl(item);
    console.log(`[${new Date().toLocaleTimeString()}] Checking: ${item.name}`);

    try {
        const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        if (!res.ok) {
            console.error(`[Error] HTTP ${res.status} for ${item.name}`);
            return;
        }

        const data = await res.json();
        const assets = data?.assets?.[item.appId]?.[2];
        const listings = data?.listinginfo;

        if (!assets || !listings) {
            console.log(`[Warning] No data for ${item.name}`);
            return;
        }

        // Build float + icon maps
        const floatByAsset = {};
        const iconByAsset = {};

        for (const [assetId, asset] of Object.entries(assets)) {
            const floatProp = asset?.asset_properties?.find(p => p?.float_value !== undefined);
            if (floatProp) {
                floatByAsset[assetId] = parseFloat(floatProp.float_value);
            }
            if (asset?.icon_url) {
                iconByAsset[assetId] = `https://steamcommunity-a.akamaihd.net/economy/image/${asset.icon_url}/256fx256f`;
            }
        }

        // Parse listings
        const results = [];
        for (const [listingId, listing] of Object.entries(listings)) {
            const assetId = listing?.asset?.id;
            const priceRaw = listing?.converted_price ?? listing?.price;
            const fee = listing?.converted_fee ?? listing?.fee;

            if (priceRaw === undefined) continue;

            const price = (priceRaw + fee) / 100;

            // Filter out listings above max price or max float
            if (price > item.maxPrice) continue;
            if (item.maxFloat !== undefined && (floatByAsset[assetId] ?? Infinity) > item.maxFloat) continue;

            results.push({
                listingId,
                assetId,
                float: floatByAsset[assetId] ?? null,
                price,
                icon: iconByAsset[assetId] ?? null,
            });
        }

        if (results.length === 0) {
            console.log(`  → No listings under CA$${item.maxPrice.toFixed(2)}`);
            return;
        }

        console.log(`  → ${results.length} listing(s) under CA$${item.maxPrice.toFixed(2)}:`);
        console.table(results.map(r => ({
            listingId: r.listingId,
            float: r.float?.toFixed(10) ?? "N/A",
            price: `CA$${r.price.toFixed(2)}`,
        })));

        // Send a Discord notification for each match
        for (const listing of results) {
            await sendDiscordNotification(item, listing);
            await new Promise(r => setTimeout(r, 500));
        }

    } catch (err) {
        console.error(`[Error] Failed to check ${item.name}:`, err.message);
    }
}

async function runChecks() {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`[${new Date().toLocaleTimeString()}] Running checks...`);
    console.log("=".repeat(50));

    for (const item of config.ITEMS) {
        await checkItem(item);
        await new Promise(r => setTimeout(r, 1500));
    }
}

// Run immediately, then on interval
runChecks();
setInterval(runChecks, config.INTERVAL_SECONDS * 1000);