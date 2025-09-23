/**
 * @fileoverview This script automates the process of publishing Markdown documentation to Confluence.
 * It reads Markdown files from a 'docs' directory, converts them to HTML, and then either creates
 * a new Confluence page or updates an existing one based on the file name.
 *
 * It's designed to be used in a CI/CD pipeline or as a standalone script for documentation management.
 * @author [Jeff Ndegwa]
 * @version 1.0.0
 */

import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { marked } from "marked";
import dotenv from "dotenv";
dotenv.config();

/**
 * @description Confluence API authentication and configuration.
 * Environment variables are used for security and flexibility.
 * @type {string}
 */
const confluence_domain_url = process.env.CONFLUENCE_DOMAIN_URL;
const confluence_email = process.env.CONFLUENCE_EMAIL;
const confluence_apiToken = process.env.CONFLUENCE_API_TOKEN;
const spaceKey = process.env.CONFLUENCE_SPACE_KEY;
const parentPageId = process.env.CONFLUENCE_PARENT_PAGE_ID;

/**
 * @description Base64-encoded authentication string for Confluence API.
 * @type {string}
 */
const auth = Buffer.from(`${confluence_email}:${confluence_apiToken}`).toString("base64");

/**
 * @function getPageByTitle
 * @description Fetches a Confluence page by its title within the configured space.
 * @param {string} title The title of the page to fetch.
 * @returns {Promise<object|null>} The page object if found, otherwise null.
 * @throws {Error} If the API request fails.
 */
async function getPageByTitle(title) {
  const url = `${confluence_domain_url}/wiki/rest/api/content?title=${encodeURIComponent(
    title
  )}&spaceKey=${spaceKey}&expand=version`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.results && data.results.length > 0 ? data.results[0] : null;
}

/**
 * @function createPage
 * @description Creates a new Confluence page with the given title and HTML content.
 * @param {string} title The title of the new page.
 * @param {string} htmlContent The HTML content for the page body.
 * @returns {Promise<void>}
 * @throws {Error} If the page creation fails.
 */
async function createPage(title, htmlContent) {
  const url = `${confluence_domain_url}/wiki/rest/api/content`;

  const payload = {
    type: "page",
    title,
    space: { key: spaceKey },
    ancestors: parentPageId ? [{ id: parentPageId }] : undefined,
    body: {
      storage: {
        value: htmlContent,
        representation: "storage",
      },
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to create page "${title}": ${response.status} ${response.statusText}\n${await response.text()}`
    );
  }

  const data = await response.json();
  console.log(`✅ Page created: ${data._links.base}${data._links.webui}`);
}

/**
 * @function updatePage
 * @description Updates an existing Confluence page.
 * @param {string} pageId The ID of the page to update.
 * @param {number} currentVersion The current version number of the page.
 * @param {string} title The title of the page.
 * @param {string} htmlContent The new HTML content for the page body.
 * @returns {Promise<void>}
 * @throws {Error} If the page update fails.
 */
async function updatePage(pageId, currentVersion, title, htmlContent) {
  const url = `${confluence_domain_url}/wiki/rest/api/content/${pageId}`;

  const payload = {
    id: pageId,
    type: "page",
    title,
    space: { key: spaceKey },
    version: { number: currentVersion + 1 },
    body: {
      storage: {
        value: htmlContent,
        representation: "storage",
      },
    },
  };

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to update page "${title}": ${response.status} ${response.statusText}\n${await response.text()}`
    );
  }

  const data = await response.json();
  console.log(`♻️ Page updated: ${data._links.base}${data._links.webui}`);
}

/**
 * @function publishDocs
 * @description The main function to find, process, and publish documentation files.
 * It reads all '.md' files from the 'docs' directory.
 * For each file, it checks if a corresponding Confluence page exists.
 * If a page exists, it updates it; otherwise, it creates a new one.
 * @returns {Promise<void>}
 */
async function publishDocs() {
  const readmePath = path.join(process.cwd(), "README.md");
  if (!fs.existsSync(readmePath)) {
    console.log("ℹ️ No README.md found at root, skipping.");
    return;
  }
  const markdown = fs.readFileSync(readmePath, "utf-8");
  const html = marked.parse(markdown);
  const title = "README";
  console.log(`📄 Processing \"${title}\"...`);
  const existingPage = await getPageByTitle(title);
  if (existingPage) {
    await updatePage(existingPage.id, existingPage.version.number, title, html);
  } else {
    await createPage(title, html);
  }
}

publishDocs().catch((err) => {
  console.error("❌ Workflow failed:", err);
  process.exit(1);
});