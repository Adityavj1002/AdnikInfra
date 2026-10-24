import styles from './FooterScene.module.css'

/**
 * Isometric miniatures in the brand palette: a tower, a villa with a pool and a house with a
 * tree, each floating gently on a gold-edged plinth. Flat polygons generated once from an
 * isometric grid (30°), so it stays sharp at any size and costs no image request.
 */
export function FooterScene({ className }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 520 260" className={`${styles.scene} ${className ?? ''}`} aria-hidden="true" focusable="false">
      <defs>
      <radialGradient id="leaf" cx="35%" cy="30%" r="75%">
      <stop offset="0" stopColor="#a3b38a" />
      <stop offset="1" stopColor="#5f7049" />
      </radialGradient>
      </defs>
      <ellipse className={styles.shadow} cx="60.0" cy="164.0" rx="57.2" ry="25.2" fill="#000" opacity="0.28" />
      <ellipse className={styles.shadow} cx="223.0" cy="211.5" rx="90.5" ry="39.9" fill="#000" opacity="0.28" />
      <ellipse className={styles.shadow} cx="394.3" cy="201.5" rx="71.4" ry="31.5" fill="#000" opacity="0.28" />
      <g className={`${styles.model} ${styles.tower}`}>
      <polygon points="8.0,150.0 60.0,180.0 60.0,174.0 8.0,144.0" fill="#c9a24a" />
      <polygon points="112.0,150.0 60.0,180.0 60.0,174.0 112.0,144.0" fill="#a8842f" />
      <polygon points="60.0,114.0 112.0,144.0 60.0,174.0 8.0,144.0" fill="#e2c77f" />
      <polygon points="10.6,144.0 60.0,172.5 60.0,172.0 10.6,143.5" fill="#e8dec8" />
      <polygon points="109.4,144.0 60.0,172.5 60.0,172.0 109.4,143.5" fill="#d6c9ac" />
      <polygon points="60.0,115.0 109.4,143.5 60.0,172.0 10.6,143.5" fill="#fbf8f2" />
      <polygon points="28.8,143.5 60.0,161.5 60.0,31.5 28.8,13.5" fill="#e8dec8" />
      <polygon points="91.2,143.5 60.0,161.5 60.0,31.5 91.2,13.5" fill="#d6c9ac" />
      <polygon points="60.0,-4.5 91.2,13.5 60.0,31.5 28.8,13.5" fill="#fbf8f2" />
      <polygon points="31.0,140.2 57.8,155.8 57.8,150.8 31.0,135.2" fill="#16263d" />
      <polygon points="89.0,140.2 62.2,155.8 62.2,150.8 89.0,135.2" fill="#0f1b2d" />
      <polygon points="31.0,130.2 57.8,145.8 57.8,140.8 31.0,125.2" fill="#16263d" />
      <polygon points="89.0,130.2 62.2,145.8 62.2,140.8 89.0,125.2" fill="#0f1b2d" />
      <polygon points="31.0,120.2 57.8,135.8 57.8,130.8 31.0,115.2" fill="#16263d" />
      <polygon points="89.0,120.2 62.2,135.8 62.2,130.8 89.0,115.2" fill="#0f1b2d" />
      <polygon points="31.0,110.2 57.8,125.8 57.8,120.8 31.0,105.2" fill="#16263d" />
      <polygon points="89.0,110.2 62.2,125.8 62.2,120.8 89.0,105.2" fill="#0f1b2d" />
      <polygon points="31.0,100.2 57.8,115.8 57.8,110.8 31.0,95.2" fill="#16263d" />
      <polygon points="89.0,100.2 62.2,115.8 62.2,110.8 89.0,95.2" fill="#0f1b2d" />
      <polygon points="31.0,90.2 57.8,105.8 57.8,100.8 31.0,85.2" fill="#16263d" />
      <polygon points="89.0,90.2 62.2,105.8 62.2,100.8 89.0,85.2" fill="#0f1b2d" />
      <polygon points="31.0,80.2 57.8,95.8 57.8,90.8 31.0,75.2" fill="#16263d" />
      <polygon points="89.0,80.2 62.2,95.8 62.2,90.8 89.0,75.2" fill="#0f1b2d" />
      <polygon points="31.0,70.2 57.8,85.8 57.8,80.8 31.0,65.2" fill="#16263d" />
      <polygon points="89.0,70.2 62.2,85.8 62.2,80.8 89.0,65.2" fill="#0f1b2d" />
      <polygon points="31.0,60.2 57.8,75.8 57.8,70.8 31.0,55.2" fill="#16263d" />
      <polygon points="89.0,60.2 62.2,75.8 62.2,70.8 89.0,55.2" fill="#0f1b2d" />
      <polygon points="31.0,50.2 57.8,65.8 57.8,60.8 31.0,45.2" fill="#16263d" />
      <polygon points="89.0,50.2 62.2,65.8 62.2,60.8 89.0,45.2" fill="#0f1b2d" />
      <polygon points="31.0,40.2 57.8,55.8 57.8,50.8 31.0,35.2" fill="#16263d" />
      <polygon points="89.0,40.2 62.2,55.8 62.2,50.8 89.0,35.2" fill="#0f1b2d" />
      <polygon points="31.0,30.2 57.8,45.8 57.8,40.8 31.0,25.2" fill="#16263d" />
      <polygon points="89.0,30.2 62.2,45.8 62.2,40.8 89.0,25.2" fill="#0f1b2d" />
      <polygon points="25.4,13.5 60.0,33.5 60.0,30.5 25.4,10.5" fill="#c9a24a" />
      <polygon points="94.6,13.5 60.0,33.5 60.0,30.5 94.6,10.5" fill="#a8842f" />
      <polygon points="60.0,-9.5 94.6,10.5 60.0,30.5 25.4,10.5" fill="#e2c77f" />
      <polygon points="44.4,10.5 60.0,19.5 60.0,10.5 44.4,1.5" fill="#16263d" />
      <polygon points="75.6,10.5 60.0,19.5 60.0,10.5 75.6,1.5" fill="#0f1b2d" />
      <polygon points="60.0,-7.5 75.6,1.5 60.0,10.5 44.4,1.5" fill="#2b3d59" />
      </g>
      <g className={`${styles.model} ${styles.villa}`}>
      <polygon points="140.7,190.0 236.0,245.0 236.0,239.0 140.7,184.0" fill="#c9a24a" />
      <polygon points="305.3,205.0 236.0,245.0 236.0,239.0 305.3,199.0" fill="#a8842f" />
      <polygon points="210.0,144.0 305.3,199.0 236.0,239.0 140.7,184.0" fill="#e2c77f" />
      <polygon points="143.3,184.0 236.0,237.5 236.0,237.0 143.3,183.5" fill="#e8dec8" />
      <polygon points="302.7,199.0 236.0,237.5 236.0,237.0 302.7,198.5" fill="#d6c9ac" />
      <polygon points="210.0,145.0 302.7,198.5 236.0,237.0 143.3,183.5" fill="#fbf8f2" />
      <polygon points="154.6,183.8 199.6,209.8 199.6,207.8 154.6,181.8" fill="#79a8bf" />
      <polygon points="222.1,196.8 199.6,209.8 199.6,207.8 222.1,194.8" fill="#5f8fa8" />
      <polygon points="177.1,168.8 222.1,194.8 199.6,207.8 154.6,181.8" fill="#9cc3d6" />
      <polygon points="215.2,190.5 262.0,217.5 262.0,191.5 215.2,164.5" fill="#e8dec8" />
      <polygon points="293.1,199.5 262.0,217.5 262.0,191.5 293.1,173.5" fill="#d6c9ac" />
      <polygon points="246.4,146.5 293.1,173.5 262.0,191.5 215.2,164.5" fill="#fbf8f2" />
      <polygon points="219.4,189.5 257.5,211.6 257.5,192.6 219.4,170.5" fill="#8fb0c7" />
      <polygon points="197.9,160.5 258.5,195.5 258.5,192.0 197.9,157.0" fill="#c9a24a" />
      <polygon points="296.6,173.5 258.5,195.5 258.5,192.0 296.6,170.0" fill="#a8842f" />
      <polygon points="236.0,135.0 296.6,170.0 258.5,192.0 197.9,157.0" fill="#e2c77f" />
      <polygon points="229.1,165.0 262.0,184.0 262.0,164.0 229.1,145.0" fill="#e8dec8" />
      <polygon points="287.9,169.0 262.0,184.0 262.0,164.0 287.9,149.0" fill="#d6c9ac" />
      <polygon points="255.0,130.0 287.9,149.0 262.0,164.0 229.1,145.0" fill="#fbf8f2" />
      <polygon points="232.4,164.0 258.4,179.0 258.4,165.0 232.4,150.0" fill="#8fb0c7" />
      <polygon points="222.1,145.0 262.0,168.0 262.0,165.0 222.1,142.0" fill="#16263d" />
      <polygon points="294.9,149.0 262.0,168.0 262.0,165.0 294.9,146.0" fill="#0f1b2d" />
      <polygon points="255.0,123.0 294.9,146.0 262.0,165.0 222.1,142.0" fill="#2b3d59" />
      </g>
      <g className={`${styles.model} ${styles.house}`}>
      <polygon points="329.4,185.0 398.7,225.0 398.7,219.0 329.4,179.0" fill="#c9a24a" />
      <polygon points="459.3,190.0 398.7,225.0 398.7,219.0 459.3,184.0" fill="#a8842f" />
      <polygon points="390.0,144.0 459.3,184.0 398.7,219.0 329.4,179.0" fill="#e2c77f" />
      <polygon points="332.0,179.0 398.7,217.5 398.7,217.0 332.0,178.5" fill="#e8dec8" />
      <polygon points="456.7,184.0 398.7,217.5 398.7,217.0 456.7,183.5" fill="#d6c9ac" />
      <polygon points="390.0,145.0 456.7,183.5 398.7,217.0 332.0,178.5" fill="#fbf8f2" />
      <polygon points="353.6,174.5 391.7,196.5 391.7,164.5 353.6,142.5" fill="#e8dec8" />
      <polygon points="428.1,175.5 391.7,196.5 391.7,164.5 428.1,143.5" fill="#d6c9ac" />
      <polygon points="390.0,121.5 428.1,143.5 391.7,164.5 353.6,142.5" fill="#fbf8f2" />
      <polygon points="431.6,143.5 391.7,166.5 411.7,133.5" fill="#d6c9ac" />
      <polygon points="370.1,109.5 411.7,133.5 391.7,166.5 350.2,142.5" fill="#2b3d59" />
      <polygon points="370.1,109.5 411.7,133.5 410.4,135.4 368.8,111.5" fill="#e2c77f" />
      <polygon points="362.3,179.5 370.9,184.5 370.9,166.5 362.3,161.5" fill="#c9a24a" />
      <polygon points="371.1,184.4 370.9,184.5 370.9,166.5 371.1,166.4" fill="#a8842f" />
      <polygon points="362.5,161.4 371.1,166.4 370.9,166.5 362.3,161.5" fill="#e2c77f" />
      <polygon points="407.1,177.9 407.3,178.0 407.3,167.0 407.1,166.9" fill="#8fb0c7" />
      <polygon points="419.4,171.0 407.3,178.0 407.3,167.0 419.4,160.0" fill="#6f93ad" />
      <polygon points="419.3,159.9 419.4,160.0 407.3,167.0 407.1,166.9" fill="#c9dbe6" />
      <rect x="395.4" y="192.5" width="3" height="18" fill="#6b5a3e" />
      <circle cx="396.9" cy="185.5" r="11" fill="url(#leaf)" />
      </g>
    </svg>
  )
}
