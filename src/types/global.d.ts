declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "three";
declare module "three/examples/jsm/loaders/OBJLoader.js";
