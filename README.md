# MD-Confluence

**md-confluence** is a reusable tool designed for **Amarok** to automate the creation and updating of Confluence documentation directly from Markdown files.  
Its main purpose is to bridge the gap between code documentation maintained in Markdown (such as `README.md`) and Confluence.  

When integrated into a CI/CD pipeline, this tool can continuously sync Markdown docs to Confluence, ensuring that internal documentation is always up to date.

---

## 🚀 Features

- **Create or update** Confluence pages from Markdown files (default: `README.md`).
- **Upload docs** via GitHub Action, using secrets or `.env` for local development.
- **Zero dependencies**: Bundled with **@vercel/ncc** for CI environments.
- **Core methods:**
  - `getPageByTitle`: Checks if a Confluence page exists by its title.
  - `createPage`: Creates a new page in Confluence.
  - `updatePage`: Updates an existing Confluence page.
  - `publishDocs`: Uploads Markdown content to Confluence.

---

## ⚙️ Usage

### Inputs & Environment Variables

Set the following environment variables (as **GitHub repository secrets** or in a local `.env` file) in the consuming repository:

| Variable                 | Description                                                      |
|--------------------------|------------------------------------------------------------------|
| `CONFLUENCE_DOMAIN_URL`  | Base URL of your Confluence instance                             |
| `CONFLUENCE_EMAIL`       | Your Confluence user email (for API authentication)              |
| `CONFLUENCE_API_TOKEN`   | Your Confluence API token                                        |
| `CONFLUENCE_SPACE_NAME`  | The Confluence space where docs are published                    |
| `CONFLUENCE_PARENT_PAGE_ID` | The ID of the parent page under which docs will be created/updated |
| `REPOSITORY_NAME`        | Name of the repository (used for page naming or organization)    |

Additionally, specify the Markdown file path via GitHub Actions input (defaults to root `README.md`):

```js
const file_path = core.getInput("file_path") || "README.md";
```

---

## 🛠️ How It Works

1. **Check for Existing Page**
   - Uses `getPageByTitle` to see if the target Confluence page already exists.
2. **Create or Update**
   - If the page **doesn’t exist** → calls `createPage`.
   - If it **does exist** → calls `updatePage`.
3. **Publish Markdown**
   - Converts the Markdown file and uploads it to Confluence via `publishDocs`.

---

## 🏗️ Action Configuration

The [`action.yaml`](./action.yaml) file defines the GitHub Action interface, specifying required inputs, output types, and metadata.  
This enables the tool to run as part of a workflow with simple configuration.

---

## 📦 Bundling with NCC

This tool uses **@vercel/ncc** for bundling:

```bash
npm install -g @vercel/ncc
ncc build index.js -o dist
```

This creates a standalone build in the `dist` folder, containing everything needed to run the tool without requiring Node.js dependencies at runtime.

> **Note:** Always run `npm run build` after making changes to the script and before pushing updates.  
> This ensures your changes are reflected in the bundled output.

---

## 📚 Package Dependencies

```json
{
  "dependencies": {
    "@actions/core": "^1.11.1",
    "dotenv": "^17.2.2",
    "marked": "^16.3.0"
  }
}
```

- **@actions/core**: For reading inputs/secrets in GitHub Actions.
- **dotenv**: For local development and testing via `.env` files.
- **marked**: For converting Markdown to HTML for Confluence.

---

## 🤝 Contributing

1. Clone the repo and make changes as needed.
2. Run `npm run build` to update the bundled output.
3. Ensure all configuration variables are set either in your environment or via GitHub secrets.
4. Submit pull requests or issues via GitHub.

---

Enjoy automated Confluence documentation directly from your Markdown files!  
If you have feedback or ideas, please open an issue or pull request.
