# Storage & Configuration Schema

All user preferences in **NMK Developer DMOJ-based Extra Configs** are isolated per site and stored in `chrome.storage.local`.

---

## 🏷️ Key Prefix Convention

Keys are structured as:
```
nmkdeveloperdmojbasedextraconfigs_${hostname}_${key}
```

*Example for `csoj.edu.vn`:*
`nmkdeveloperdmojbasedextraconfigs_csoj.edu.vn_logo_custom`

---

## 📋 Configuration Keys

### Logo & Navbar
| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `logo_custom` | `string (base64)` | `null` | Custom uploaded logo image URL |
| `logo_default_cache` | `string (base64)` | `null` | Cached fallback logo image URL |
| `logo_use_original` | `'0' \| '1'` | `'0'` | Use original site logo |
| `logo_img_ratio` | `number` | `1.0` | Natural aspect ratio of the active logo |
| `logo_size_mode` | `'auto' \| 'manual'` | `'auto'` | Size mode: fit to navbar or custom |
| `logo_w` | `number` | `40` | Custom logo width in pixels |
| `logo_h` | `number` | `40` | Custom logo height in pixels |
| `logo_lock` | `'0' \| '1'` | `'1'` | Lock original aspect ratio |
| `logo_gap` | `number` | `4` | Outer margin around logo |
| `logo_radius` | `number` | `0` | Border radius in percentage (0–50%) |
| `logo_fit` | `'contain' \| 'cover' \| 'fill'` | `'contain'` | Object-fit strategy |
| `logo_nav_h` | `number` | `52` | Navbar height |
| `logo_nav_h_auto` | `'0' \| '1'` | `'1'` | Auto navbar height |
| `logo_nav_w` | `number` | `100` | Navbar width percentage (40–100%) |
| `logo_nav_w_auto` | `'0' \| '1'` | `'1'` | Full width navbar |
| `logo_div_show` | `'0' \| '1'` | `'1'` | Show or hide navbar divider |
| `logo_div_h` | `number` | `60` | Divider height percentage |
| `logo_div_h_auto` | `'0' \| '1'` | `'1'` | Auto-match divider to logo height |
| `logo_div_w` | `number` | `1` | Divider thickness in pixels |
| `logo_div_w_auto` | `'0' \| '1'` | `'1'` | Auto divider thickness |
| `logo_div_ml` | `number` | `6` | Divider margin-left in pixels |
| `logo_div_mr` | `number` | `6` | Divider margin-right in pixels |
| `logo_div_op` | `number` | `40` | Divider opacity (0–100%) |
| `logo_nav_gap` | `number` | `0` | Gap between navigation items |
| `logo_nav_align` | `string` | `'center'` | Flex alignment (`center`, `flex-start`, etc.) |

---

### Wallpaper & Background
| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `bg_custom` | `string (base64)` | `null` | Custom background image data URL |
| `bg_opacity` | `number` | `85` | Dark overlay opacity (0–100%) |

---

### Quote Card
| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `quote_text` | `string` | `"Stay focused."` | Content in Markdown/LaTeX format |
| `quote_size` | `number` | `14` | Font size in pixels |
| `quote_pos` | `object` | `{x, y}` | Floating window coordinates |

---

### Pomodoro & 2048
| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `pomo_work` | `number` | `25` | Work session duration in minutes |
| `pomo_break` | `number` | `5` | Short break duration in minutes |
| `game2048_best` | `number` | `0` | Best score achieved in 2048 |

---

### Global / Domain Settings (Not prefixed)
| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `dmoj_domains` | `string[]` | `["csoj.edu.vn", "oj.vnoi.info", "dmoj.ca"]` | List of enabled DMOJ hostnames |
