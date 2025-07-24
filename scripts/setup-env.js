#!/usr/bin/env node

import { execSync } from 'child_process';
import { exportJWK, exportPKCS8, generateKeyPair } from 'jose';
import fs from 'fs';
import path from 'path';

console.log('🚀 Setting up Convex Auth environment variables...\n');

// Helper function to run convex commands
function runConvexCommand(command) {
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Helper function to check if an environment variable exists
function checkEnvVar(varName) {
  const result = runConvexCommand(`npx convex env get ${varName}`);
  const exists = result.success && result.output && result.output.trim() && !result.output.includes('not found');
  console.log(`🔍 Checking ${varName}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
  if (!exists) {
    console.log(`   Command output: "${result.output ? result.output.trim() : 'empty'}"`);
    console.log(`   Command success: ${result.success}`);
  }
  return exists;
}

// Helper function to set environment variable if it doesn't exist
function setEnvVarIfNotExists(varName, value, description) {
  if (checkEnvVar(varName)) {
    console.log(`✅ ${varName} already exists, skipping...`);
    return true;
  }

  console.log(`⚙️  Setting ${varName}...`);

  // For long values like JWT keys, use stdin to avoid command line length limits
  if (value.length > 500) {
    try {
      const result = execSync(`echo '${value}' | npx convex env set ${varName} --stdin`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log(`✅ ${varName} set successfully`);
      return true;
    } catch (error) {
      // Fallback: try escaping the value differently
      try {
        const escapedValue = value.replace(/"/g, '\\"').replace(/'/g, "\\'");
        const result = runConvexCommand(`npx convex env set ${varName} '${escapedValue}'`);

        if (result.success) {
          console.log(`✅ ${varName} set successfully`);
          return true;
        } else {
          console.error(`❌ Failed to set ${varName}: ${result.error}`);
          return false;
        }
      } catch (fallbackError) {
        console.error(`❌ Failed to set ${varName}: ${error.message}`);
        return false;
      }
    }
  } else {
    const result = runConvexCommand(`npx convex env set ${varName} "${value}"`);

    if (result.success) {
      console.log(`✅ ${varName} set successfully`);
      return true;
    } else {
      console.error(`❌ Failed to set ${varName}: ${result.error}`);
      return false;
    }
  }
}

// Generate JWT keys if needed
async function generateJWTKeys() {
  if (checkEnvVar('JWT_PRIVATE_KEY')) {
    console.log('✅ JWT_PRIVATE_KEY already exists, skipping key generation...');
    return { privateKey: null, jwks: null };
  }

  console.log('🔑 Generating JWT keys...');

  try {
    const keys = await generateKeyPair("RS256", {
      extractable: true,
    });

    const privateKey = await exportPKCS8(keys.privateKey);
    const publicKey = await exportJWK(keys.publicKey);
    const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

    // Format private key for environment variable (single line with spaces)
    const formattedPrivateKey = privateKey.trimEnd().replace(/\n/g, " ");

    console.log('✅ JWT keys generated successfully');
    return { privateKey: formattedPrivateKey, jwks };
  } catch (error) {
    console.error('❌ Failed to generate JWT keys:', error.message);
    return { privateKey: null, jwks: null };
  }
}

// Main setup function
async function setupEnvironment() {
  console.log('📋 Checking Convex deployment...');

  // Check if convex is initialized
  const convexCheck = runConvexCommand('npx convex env list');
  if (!convexCheck.success) {
    console.error('❌ Convex not initialized. Please run "npx convex dev" first.');
    process.exit(1);
  }

  console.log('✅ Convex deployment found\n');

  // Generate JWT keys
  const { privateKey, jwks } = await generateJWTKeys();

  // Required environment variables
  const envVars = [
    {
      name: 'SITE_URL',
      value: 'http://localhost:3000',
      description: 'Site URL for OAuth redirects and magic links'
    },
    {
      name: 'JWT_PRIVATE_KEY',
      value: privateKey,
      description: 'Private key for JWT token signing',
      skip: !privateKey
    },
    {
      name: 'JWKS',
      value: jwks,
      description: 'JSON Web Key Set for JWT verification',
      skip: !jwks
    }
  ];

  // Optional OAuth environment variables (placeholders)
  const optionalEnvVars = [
    {
      name: 'AUTH_GOOGLE_ID',
      value: 'your_google_client_id_here',
      description: 'Google OAuth Client ID (replace with actual value)'
    },
    {
      name: 'AUTH_GOOGLE_SECRET',
      value: 'your_google_client_secret_here',
      description: 'Google OAuth Client Secret (replace with actual value)'
    },
    {
      name: 'AUTH_GITHUB_ID',
      value: 'your_github_client_id_here',
      description: 'GitHub OAuth Client ID (replace with actual value)'
    },
    {
      name: 'AUTH_GITHUB_SECRET',
      value: 'your_github_client_secret_here',
      description: 'GitHub OAuth Client Secret (replace with actual value)'
    }
  ];

  console.log('🔧 Setting up required environment variables...\n');

  let allSuccess = true;

  // Set required environment variables
  for (const envVar of envVars) {
    if (envVar.skip) continue;

    const success = setEnvVarIfNotExists(envVar.name, envVar.value, envVar.description);
    if (!success) allSuccess = false;
  }

  console.log('\n🔧 Setting up optional OAuth environment variables (with placeholders)...\n');

  // Set optional environment variables with placeholders
  for (const envVar of optionalEnvVars) {
    setEnvVarIfNotExists(envVar.name, envVar.value, envVar.description);
  }

  console.log('\n📝 Environment setup summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (allSuccess) {
    console.log('✅ All required environment variables are set up!');
  } else {
    console.log('⚠️  Some required environment variables failed to set up.');
  }

  console.log('\n📋 Next steps:');
  console.log('1. Replace OAuth placeholder values with actual credentials:');
  console.log('   - Get Google OAuth credentials from: https://console.cloud.google.com/');
  console.log('   - Get GitHub OAuth credentials from: https://github.com/settings/developers');
  console.log('2. Update OAuth credentials using:');
  console.log('   npx convex env set AUTH_GOOGLE_ID your_actual_google_id');
  console.log('   npx convex env set AUTH_GOOGLE_SECRET your_actual_google_secret');
  console.log('   npx convex env set AUTH_GITHUB_ID your_actual_github_id');
  console.log('   npx convex env set AUTH_GITHUB_SECRET your_actual_github_secret');
  console.log('3. For production, update SITE_URL:');
  console.log('   npx convex env set SITE_URL https://your-domain.com');
  console.log('\n🚀 Run "npm run dev" to start the development server!');
}

// Run the setup
setupEnvironment().catch(error => {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
});