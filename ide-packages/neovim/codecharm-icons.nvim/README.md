# CodeCharm Icons for Neovim

💝 Charming icon theme with 1,600+ language support

## Installation

### Using [lazy.nvim](https://github.com/folke/lazy.nvim)

```lua
{
  'admin/codecharm-icons.nvim',
  config = function()
    require('codecharm-icons').setup({
      variant = 'base' -- 'base', 'light', 'soft', or 'warm'
    })
  end
}
```

### Using [packer.nvim](https://github.com/wbthomason/packer.nvim)

```lua
use {
  'admin/codecharm-icons.nvim',
  config = function()
    require('codecharm-icons').setup()
  end
}
```

## License

MIT
