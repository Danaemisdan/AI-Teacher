async function assertUI(page) {
    const errors = [];
    
    // Check for leaked tags in the visible text
    const textContent = await page.evaluate(() => document.body.innerText);
    const leakedTags = ['[TOOL_ACTION', '[MERMAID', '[GRAPH', '[IMAGE'];
    for (const tag of leakedTags) {
        if (textContent.includes(tag)) {
            errors.push(`Protocol Leak: Found ${tag} in UI`);
        }
    }

    // Check for mock responses
    if (textContent.toLowerCase().includes('mock response') || textContent.includes('Could not find suitable media')) {
        errors.push(`Found mock placeholder or media error in UI`);
    }

    // Capture console errors
    // We will attach an event listener in the runner for console errors

    return errors;
}

async function verifyInteractive(page, type) {
    if (type === '3dmol' || type === 'anatomy') {
        const canvas = await page.$('canvas');
        if (!canvas) throw new Error("Canvas not found for 3D interaction");
        const box = await canvas.boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2 + 50);
        await page.mouse.up();
        return true;
    } else if (type === 'jsxgraph') {
        const jxg = await page.$('.jxgbox');
        if (!jxg) throw new Error("JSXGraph box not found for interaction");
        const box = await jxg.boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.wheel({ deltaY: -100 });
        return true;
    } else if (type === 'mermaid' || type === 'concept') {
        const svg = await page.$('svg');
        if (!svg) throw new Error("SVG not found for interaction");
        return true;
    }
    return false;
}

module.exports = { assertUI, verifyInteractive };
