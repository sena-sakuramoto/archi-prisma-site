uniform float uTime;
uniform samplerCube uEnvMap;
uniform vec3 uCameraPosition;
uniform float uIntensity;
uniform vec2 uPointer;

varying vec3 vWorldPosition;
varying vec3 vNormal;

// High-fidelity spectral dispersion
vec3 refractColor(vec3 viewDir, vec3 normal, float ior, float dispersion) {
  vec3 r = refract(-viewDir, normal, 1.0 / (ior - dispersion));
  vec3 g = refract(-viewDir, normal, 1.0 / ior);
  vec3 b = refract(-viewDir, normal, 1.0 / (ior + dispersion));
  
  return vec3(
    textureCube(uEnvMap, r).r,
    textureCube(uEnvMap, g).g,
    textureCube(uEnvMap, b).b
  );
}

void main() {
  vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
  vec3 normal = normalize(vNormal);
  
  // 1. Mouse Interaction (Space Distortion)
  float mouseDist = length(vWorldPosition.xy - uPointer * 5.0);
  float distortion = exp(-mouseDist * 0.5) * 0.2;
  vec3 activeNormal = normalize(normal + vec3(distortion));

  // 2. Multi-Bounce Refraction Logic
  float baseIOR = 1.6 + uIntensity * 0.2;
  float dispersion = 0.08 + uIntensity * 0.1;
  
  // Pass 1: Outer surface
  vec3 color1 = refractColor(viewDir, activeNormal, baseIOR, dispersion);
  
  // Pass 2: Inner reflection (Fake 2nd bounce)
  vec3 reflectDir = reflect(-viewDir, activeNormal);
  vec3 color2 = textureCube(uEnvMap, reflectDir).rgb;
  
  // Pass 3: Spectral highlights
  float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 5.0);
  
  // 3. Architectural Edge Light
  float edge = pow(1.0 - max(dot(viewDir, normal), 0.0), 12.0);
  vec3 glow = vec3(0.4, 0.7, 1.0) * edge * 4.0;

  // Final Composition (Weighted mix for maximum depth)
  vec3 finalColor = mix(color1 * 0.8 + color2 * 0.2, color2, fresnel);
  finalColor += glow;
  
  // Tone mapping for cinematic look
  finalColor = pow(finalColor, vec3(0.9));
  finalColor *= 1.5;

  gl_FragColor = vec4(finalColor, 1.0);
}
