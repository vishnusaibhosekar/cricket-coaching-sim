#!/usr/bin/env node
/**
 * Test 4: InsForge Database - Connection & Operations
 * 
 * Usage: node scripts/test-insforge-db.js
 * 
 * Tests InsForge database connection and basic CRUD operations
 */

require('dotenv').config({ path: '.env.local' });

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL;

async function testInsForgeDB() {
  console.log('🧪 Testing InsForge Database\n');
  console.log('===========================================\n');

  // Check configuration
  if (!INSFORGE_URL) {
    console.error('❌ Error: NEXT_PUBLIC_INSFORGE_URL not found in .env.local');
    process.exit(1);
  }

  console.log(`🌐 InsForge URL: ${INSFORGE_URL}`);
  console.log('\n⏳ Testing database connection...\n');

  try {
    // Test 1: Try to query decisions table
    console.log('📋 Test 1: Query decisions table');
    
    const queryResponse = await fetch(`${INSFORGE_URL}/rest/v1/decisions?limit=5`, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact',
      },
    });

    console.log(`   Status: ${queryResponse.status} ${queryResponse.statusText}`);

    if (queryResponse.ok) {
      const data = await queryResponse.json();
      const count = queryResponse.headers.get('content-range')?.split('/')[1] || 'unknown';
      
      console.log(`   ✅ Query successful`);
      console.log(`   - Total records: ${count}`);
      console.log(`   - Sample records: ${data.length}`);
      
      if (data.length > 0) {
        console.log(`   - First record ID: ${data[0].id}`);
      }
    } else {
      const errorText = await queryResponse.text();
      console.warn(`   ⚠️  Query failed (table might not exist yet)`);
      console.warn(`   - Error: ${errorText.substring(0, 100)}`);
    }

    // Test 2: Try to insert a test decision
    console.log('\n📝 Test 2: Insert test decision');
    
    const testDecision = {
      match_id: 'test-match-001',
      over_number: 10,
      decision_type: 'bowling_change',
      user_choice: { bowlerName: 'Test Bowler' },
      match_context: {
        score: 'SRH 100/3',
        overs: 10,
        batsmen: [],
        phase: 'middle',
        runRate: 10.0,
      },
      merit_score: 75,
      merit_breakdown: {
        total_score: 75,
        situation_awareness: 20,
        matchup_intelligence: 18,
        risk_reward: 19,
        strategic_creativity: 18,
        explanation: 'Test decision',
        comparison_to_captain: 'Test comparison',
      },
    };

    const insertResponse = await fetch(`${INSFORGE_URL}/rest/v1/decisions`, {
      method: 'POST',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(testDecision),
    });

    console.log(`   Status: ${insertResponse.status} ${insertResponse.statusText}`);

    if (insertResponse.ok) {
      const inserted = await insertResponse.json();
      console.log(`   ✅ Insert successful`);
      console.log(`   - Record ID: ${inserted[0]?.id}`);
      
      // Test 3: Update the test decision
      console.log('\n✏️  Test 3: Update test decision');
      
      const updateResponse = await fetch(`${INSFORGE_URL}/rest/v1/decisions?id=eq.${inserted[0]?.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ merit_score: 80 }),
      });

      console.log(`   Status: ${updateResponse.status} ${updateResponse.statusText}`);

      if (updateResponse.ok) {
        console.log(`   ✅ Update successful`);
        
        // Test 4: Delete the test decision
        console.log('\n🗑️  Test 4: Delete test decision');
        
        const deleteResponse = await fetch(`${INSFORGE_URL}/rest/v1/decisions?id=eq.${inserted[0]?.id}`, {
          method: 'DELETE',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY}`,
          },
        });

        console.log(`   Status: ${deleteResponse.status} ${deleteResponse.statusText}`);

        if (deleteResponse.ok) {
          console.log(`   ✅ Delete successful`);
        } else {
          console.warn(`   ⚠️  Delete failed`);
        }
      } else {
        console.warn(`   ⚠️  Update failed`);
      }
    } else {
      const errorText = await insertResponse.text();
      console.warn(`   ⚠️  Insert failed (table might not exist or RLS policy issue)`);
      console.warn(`   - Error: ${errorText.substring(0, 150)}`);
    }

    console.log('\n✅ InsForge database tests completed');
    console.log('\n📋 Next steps:');
    console.log('   1. If queries failed, run database-setup.sql in InsForge dashboard');
    console.log('   2. Check RLS policies are configured correctly');
    console.log('   3. Ensure user is authenticated before making requests');

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

testInsForgeDB();
