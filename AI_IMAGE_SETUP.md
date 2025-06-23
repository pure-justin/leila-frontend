# AI Image Generation Setup Guide

## Quick Start - Free Options

### Option 1: Hugging Face (Recommended - Free)
1. Go to https://huggingface.co/join
2. Create a free account
3. Go to https://huggingface.co/settings/tokens
4. Click "New token"
5. Name it "leila-images" and select "write" permission
6. Copy the token and add to `.env.local`:
   ```
   HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxx
   ```

### Option 2: Replicate (Free Trial)
1. Go to https://replicate.com
2. Sign up for free account (includes $5 credit)
3. Go to https://replicate.com/account/api-tokens
4. Copy your API token and add to `.env.local`:
   ```
   REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxx
   ```

### Option 3: Stability AI (Free Trial)
1. Go to https://platform.stability.ai
2. Sign up for free account
3. Go to https://platform.stability.ai/account/keys
4. Create an API key
5. Add to `.env.local`:
   ```
   STABILITY_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
   ```

## Generate Images

Once you have at least one API key configured:

```bash
# Check which services are available
npm run ai:check

# Generate images using available services
npm run ai:generate
```

## Using Google Vertex AI (Advanced)

If you have Google Cloud access through Firebase:

1. Enable Vertex AI API in Google Cloud Console
2. Enable billing for your project
3. Run: `gcloud auth application-default login`
4. Images will automatically use Vertex AI

## Current Status

✅ Professional placeholder images generated
✅ Image component integrated (`ServiceImage.tsx`)
✅ Service catalog updated with image mappings
✅ Multiple size variants (hero, thumbnail, card, mobile)

## Image Locations

All images are stored in:
```
/shared-assets/images/services/
├── electrical/
├── plumbing/
├── hvac/
├── cleaning/
├── handyman/
├── landscaping/
├── appliance/
└── pest-control/
```

## Next Steps

1. Get an API key (Hugging Face is easiest)
2. Add to `.env.local`
3. Run `npm run ai:generate`
4. Images will be automatically upgraded from placeholders to AI-generated photos