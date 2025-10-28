/**
 * Migration script to convert inline presentation content to separate HTML files
 *
 * This script:
 * 1. Reads all presentation .astro files
 * 2. Extracts metadata and slide content
 * 3. Creates a directory structure for each presentation
 * 4. Saves each slide as a separate HTML file
 * 5. Creates a metadata.json file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get project root
const projectRoot = path.resolve(__dirname, '..');

// Define paths
const pagesEnDir = path.join(projectRoot, 'src/pages/en/presentations');
const pagesIdDir = path.join(projectRoot, 'src/pages/id/presentations');
const contentEnDir = path.join(projectRoot, 'src/content/presentations-en');
const contentIdDir = path.join(projectRoot, 'src/content/presentations-id');

/**
 * Parse an Astro presentation file and extract metadata and slides
 */
function parsePresentationFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract presentationData object
  const presentationDataMatch = content.match(/const presentationData = \{([\s\S]*?)\};/);
  if (!presentationDataMatch) {
    throw new Error(`Could not find presentationData in ${filePath}`);
  }

  // Extract slides array
  const slidesMatch = content.match(/const slides = \[([\s\S]*?)\];/);
  if (!slidesMatch) {
    throw new Error(`Could not find slides array in ${filePath}`);
  }

  // Parse metadata (simple regex-based extraction)
  const metadata = {};
  const metadataContent = presentationDataMatch[1];

  // Extract each field
  const titleMatch = metadataContent.match(/title:\s*"([^"]+)"/);
  const descriptionMatch = metadataContent.match(/description:\s*"([^"]+)"/);
  const pubDateMatch = metadataContent.match(/pubDate:\s*"([^"]+)"/);
  const relatedBlogPostMatch = metadataContent.match(/relatedBlogPost:\s*"([^"]+)"/);
  const categoryMatch = metadataContent.match(/category:\s*"([^"]+)"/);
  const tagsMatch = metadataContent.match(/tags:\s*\[(.*?)\]/);
  const difficultyMatch = metadataContent.match(/difficulty:\s*"([^"]+)"/);
  const languageMatch = metadataContent.match(/language:\s*"([^"]+)"/);
  const estimatedTimeMatch = metadataContent.match(/estimatedTime:\s*(\d+)/);
  const totalSlidesMatch = metadataContent.match(/totalSlides:\s*(\d+)/);
  const authorMatch = metadataContent.match(/author:\s*"([^"]+)"/);

  if (titleMatch) metadata.title = titleMatch[1];
  if (descriptionMatch) metadata.description = descriptionMatch[1];
  if (pubDateMatch) metadata.pubDate = pubDateMatch[1];
  if (relatedBlogPostMatch) metadata.relatedBlogPost = relatedBlogPostMatch[1];
  if (categoryMatch) metadata.category = categoryMatch[1];
  if (tagsMatch) {
    metadata.tags = tagsMatch[1].split(',').map(tag =>
      tag.trim().replace(/['"]/g, '')
    );
  }
  if (difficultyMatch) metadata.difficulty = difficultyMatch[1];
  if (languageMatch) metadata.language = languageMatch[1];
  if (estimatedTimeMatch) metadata.estimatedTime = parseInt(estimatedTimeMatch[1]);
  if (totalSlidesMatch) metadata.totalSlides = parseInt(totalSlidesMatch[1]);
  if (authorMatch) metadata.author = authorMatch[1];

  // Parse slides array
  const slides = [];
  const slidesContent = slidesMatch[1];

  // Split by slide objects - match each { title: ..., time: ..., content: `` }
  const slideRegex = /\{\s*title:\s*"([^"]+)",\s*time:\s*"([^"]+)",\s*content:\s*`([\s\S]*?)`\s*\}/g;

  let match;
  while ((match = slideRegex.exec(slidesContent)) !== null) {
    slides.push({
      title: match[1],
      time: match[2],
      content: match[3]
    });
  }

  return { metadata, slides };
}

/**
 * Create directory structure and save presentation files
 */
function migratePresentationFile(sourceFile, targetDir, language) {
  const fileName = path.basename(sourceFile, '.astro');
  console.log(`\n📦 Migrating: ${fileName} (${language})`);

  try {
    // Parse the presentation file
    const { metadata, slides } = parsePresentationFile(sourceFile);

    // Create presentation directory
    const presentationDir = path.join(targetDir, fileName);
    if (!fs.existsSync(presentationDir)) {
      fs.mkdirSync(presentationDir, { recursive: true });
    }

    // Save metadata.json
    const metadataPath = path.join(presentationDir, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`  ✓ Created metadata.json`);

    // Save each slide as a separate HTML file
    slides.forEach((slide, index) => {
      const slideNumber = String(index + 1).padStart(2, '0');
      const slideFileName = `slide-${slideNumber}.html`;
      const slidePath = path.join(presentationDir, slideFileName);

      // Add comment header to each slide file for context
      const slideContent = `<!--
  Slide ${index + 1}: ${slide.title}
  Time: ${slide.time}
-->
${slide.content}`;

      fs.writeFileSync(slidePath, slideContent);
      console.log(`  ✓ Created ${slideFileName} - ${slide.title}`);
    });

    // Create slide-metadata.json with slide titles and times
    const slideMetadata = slides.map((slide, index) => ({
      slideNumber: index + 1,
      title: slide.title,
      time: slide.time,
      fileName: `slide-${String(index + 1).padStart(2, '0')}.html`
    }));

    const slideMetadataPath = path.join(presentationDir, 'slide-metadata.json');
    fs.writeFileSync(slideMetadataPath, JSON.stringify(slideMetadata, null, 2));
    console.log(`  ✓ Created slide-metadata.json`);

    console.log(`✅ Successfully migrated ${fileName} with ${slides.length} slides`);

    return true;
  } catch (error) {
    console.error(`❌ Error migrating ${fileName}:`, error.message);
    return false;
  }
}

/**
 * Main migration function
 */
function migrateAllPresentations() {
  console.log('🚀 Starting presentation migration...\n');

  // Ensure target directories exist
  [contentEnDir, contentIdDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });

  let totalMigrated = 0;
  let totalFailed = 0;

  // Migrate English presentations
  console.log('\n📚 Migrating English presentations...');
  if (fs.existsSync(pagesEnDir)) {
    const enFiles = fs.readdirSync(pagesEnDir).filter(f => f.endsWith('.astro'));

    enFiles.forEach(file => {
      const sourceFile = path.join(pagesEnDir, file);
      const success = migratePresentationFile(sourceFile, contentEnDir, 'en');
      if (success) totalMigrated++;
      else totalFailed++;
    });
  }

  // Migrate Indonesian presentations
  console.log('\n📚 Migrating Indonesian presentations...');
  if (fs.existsSync(pagesIdDir)) {
    const idFiles = fs.readdirSync(pagesIdDir).filter(f => f.endsWith('.astro'));

    idFiles.forEach(file => {
      const sourceFile = path.join(pagesIdDir, file);
      const success = migratePresentationFile(sourceFile, contentIdDir, 'id');
      if (success) totalMigrated++;
      else totalFailed++;
    });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration Summary:');
  console.log(`  ✅ Successfully migrated: ${totalMigrated}`);
  console.log(`  ❌ Failed: ${totalFailed}`);
  console.log('='.repeat(60));

  if (totalMigrated > 0) {
    console.log('\n✨ Next steps:');
    console.log('  1. Check the migrated files in src/content/presentations-en/ and presentations-id/');
    console.log('  2. Update your presentation components to load from these files');
    console.log('  3. Test the presentations to ensure they work correctly');
    console.log('  4. Once verified, you can remove the old .astro files from src/pages/');
  }
}

// Run migration
migrateAllPresentations();
