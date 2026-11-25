// Stands in for image imports under Vitest. Next turns `import x from "./a.png"` into this shape;
// Vite alone would give a string, which the content schema rejects.
const image = { src: "/stub.png", width: 16, height: 16 };

export default image;
