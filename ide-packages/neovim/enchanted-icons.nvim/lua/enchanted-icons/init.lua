-- Enchanted Icons for Neovim
local M = {}

M.icons = {}

function M.setup(opts)
  opts = opts or {}
  local variant = opts.variant or 'mystic'
  
  -- Integration with nvim-web-devicons
  local has_devicons, devicons = pcall(require, 'nvim-web-devicons')
  if has_devicons then
    devicons.setup({
      override = M.icons,
      default = true
    })
  end
end

return M
