#!/bin/bash

# Create directories
echo "Creating directories..."
mkdir -p public/assets/services/categories
mkdir -p public/assets/services/services

# Category Hero Images
echo "Downloading category hero images..."

# Electrical
curl -L "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/categories/electrical-hero.jpg"

# Plumbing
curl -L "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/categories/plumbing-hero.jpg"

# HVAC
curl -L "https://images.pexels.com/photos/3964736/pexels-photo-3964736.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/categories/hvac-hero.jpg"

# Cleaning
curl -L "https://images.pexels.com/photos/4239146/pexels-photo-4239146.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/categories/cleaning-hero.jpg"

# Landscaping
curl -L "https://images.pexels.com/photos/1599969/pexels-photo-1599969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/categories/landscaping-hero.jpg"

# Pest Control
curl -L "https://images.pexels.com/photos/4481326/pexels-photo-4481326.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/categories/pest-control-hero.jpg"

# Handyman
curl -L "https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/categories/handyman-hero.jpg"

# Painting
curl -L "https://images.pexels.com/photos/4481942/pexels-photo-4481942.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/categories/painting-hero.jpg"

# Service Specific Images
echo "Downloading service-specific images..."

# Electrical Services
curl -L "https://images.pexels.com/photos/1435737/pexels-photo-1435737.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/electrical-repair.jpg"
curl -L "https://images.pexels.com/photos/257700/pexels-photo-257700.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/panel-upgrade.jpg"
curl -L "https://images.pexels.com/photos/5086477/pexels-photo-5086477.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/ev-charger-install.jpg"
curl -L "https://images.pexels.com/photos/5824517/pexels-photo-5824517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/lighting-install.jpg"
curl -L "https://images.pexels.com/photos/7861921/pexels-photo-7861921.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/ceiling-fan-install.jpg"

# Plumbing Services
curl -L "https://images.pexels.com/photos/5774807/pexels-photo-5774807.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/leak-repair.jpg"
curl -L "https://images.pexels.com/photos/6419179/pexels-photo-6419179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/drain-cleaning.jpg"
curl -L "https://images.pexels.com/photos/6444258/pexels-photo-6444258.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/toilet-repair.jpg"
curl -L "https://images.pexels.com/photos/15616669/pexels-photo-15616669.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/water-heater-install.jpg"
curl -L "https://images.pexels.com/photos/7641844/pexels-photo-7641844.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/faucet-install.jpg"

# HVAC Services
curl -L "https://images.pexels.com/photos/3964704/pexels-photo-3964704.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/ac-repair.jpg"
curl -L "https://images.pexels.com/photos/7269666/pexels-photo-7269666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/furnace-repair.jpg"
curl -L "https://images.pexels.com/photos/3964736/pexels-photo-3964736.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/hvac-maintenance.jpg"
curl -L "https://images.pexels.com/photos/7269665/pexels-photo-7269665.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/duct-cleaning.jpg"

# Cleaning Services
curl -L "https://images.pexels.com/photos/4239146/pexels-photo-4239146.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/house-cleaning.jpg"
curl -L "https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/deep-cleaning.jpg"
curl -L "https://images.pexels.com/photos/4107278/pexels-photo-4107278.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/carpet-cleaning.jpg"
curl -L "https://images.pexels.com/photos/4098778/pexels-photo-4098778.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/window-cleaning.jpg"

# Landscaping Services
curl -L "https://images.pexels.com/photos/1453499/pexels-photo-1453499.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/lawn-mowing.jpg"
curl -L "https://images.pexels.com/photos/4750274/pexels-photo-4750274.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/tree-trimming.jpg"
curl -L "https://images.pexels.com/photos/1105019/pexels-photo-1105019.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/garden-design.jpg"
curl -L "https://images.pexels.com/photos/6231874/pexels-photo-6231874.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/leaf-removal.jpg"

# Handyman Services
curl -L "https://images.pexels.com/photos/5089178/pexels-photo-5089178.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/furniture-assembly.jpg"
curl -L "https://images.pexels.com/photos/7130475/pexels-photo-7130475.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/tv-mounting.jpg"
curl -L "https://images.pexels.com/photos/7218525/pexels-photo-7218525.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/drywall-repair.jpg"
curl -L "https://images.pexels.com/photos/8961495/pexels-photo-8961495.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/door-repair.jpg"

# Painting Services
curl -L "https://images.pexels.com/photos/7218006/pexels-photo-7218006.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/interior-painting.jpg"
curl -L "https://images.pexels.com/photos/221027/pexels-photo-221027.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/exterior-painting.jpg"
curl -L "https://images.pexels.com/photos/6474516/pexels-photo-6474516.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/cabinet-painting.jpg"

# Default image
curl -L "https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" -o "public/assets/services/services/default.jpg"

echo "✅ Download complete! Images saved to public/assets/services/"