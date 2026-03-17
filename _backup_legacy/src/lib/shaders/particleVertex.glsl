uniform sampler2D uPositionTexture;
uniform vec3 uPrismCenter;
uniform float uPointSize;

varying float vLife;
varying float vDistance;

void main() {
  vec2 uv = position.xy; // UV coords passed from buffer geometry
  vec4 posData = texture2D(uPositionTexture, uv);
  vec3 pos = posData.xyz;
  vLife = posData.w;

  vec4 mvPosition = viewMatrix * modelMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  vDistance = -mvPosition.z;

  // Size attenuation
  gl_PointSize = uPointSize * (200.0 / -mvPosition.z);
  
  // Blink effect based on life
  gl_PointSize *= smoothstep(0.0, 0.1, vLife) * smoothstep(1.0, 0.9, vLife);
}
