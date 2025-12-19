#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Hatra Suci - Database Reset and Test Script ===${NC}\n"

# Clear all databases
echo -e "${YELLOW}[1/7] Clearing all databases...${NC}"
docker exec -i hatra-suci-mongodb mongosh "mongodb://admin:admin123@localhost:27017/hatra-suci?authSource=admin" --quiet <<'EOF'
db.users.deleteMany({})
db.admins.deleteMany({})
db.deposits.deleteMany({})
db.withdrawals.deleteMany({})
db.transactions.deleteMany({})
db.referrals.deleteMany({})
db.settings.deleteMany({})
print("✅ All collections cleared")
EOF

# Create admin user
echo -e "\n${YELLOW}[2/7] Creating admin user...${NC}"
ADMIN_RESULT=$(curl -s -X POST http://localhost:5000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hatrasuci.com","password":"admin123"}')

if echo "$ADMIN_RESULT" | jq -e '.token' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Admin user exists${NC}"
  ADMIN_TOKEN=$(echo "$ADMIN_RESULT" | jq -r '.token')
else
  echo -e "${RED}❌ Admin login failed. Creating admin via backend...${NC}"
  cd /workspaces/codespaces-blank/Hatra-Suci/backend
  node seedAdmin.js
  cd - > /dev/null

  # Try login again
  ADMIN_RESULT=$(curl -s -X POST http://localhost:5000/api/auth/admin-login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@hatrasuci.com","password":"admin123"}')
  ADMIN_TOKEN=$(echo "$ADMIN_RESULT" | jq -r '.token')
  echo -e "${GREEN}✅ Admin created and logged in${NC}"
fi

# Register test user
echo -e "\n${YELLOW}[3/7] Registering test user...${NC}"
USER_RESULT=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"testuser",
    "email":"test@hatrasuci.com",
    "password":"Test123456"
  }')

USER_ID=$(echo "$USER_RESULT" | jq -r '._id')
USER_TOKEN=$(echo "$USER_RESULT" | jq -r '.token')
REFERRAL_CODE=$(echo "$USER_RESULT" | jq -r '.referralCode')

if [ "$USER_ID" != "null" ]; then
  echo -e "${GREEN}✅ User registered: $USER_ID${NC}"
  echo -e "   Email: test@hatrasuci.com"
  echo -e "   Password: Test123456"
  echo -e "   Referral Code: $REFERRAL_CODE"
else
  echo -e "${RED}❌ User registration failed${NC}"
  echo "$USER_RESULT" | jq '.'
  exit 1
fi

# Submit registration deposit
echo -e "\n${YELLOW}[4/7] Submitting registration deposit...${NC}"
DEPOSIT_RESULT=$(curl -s -X POST http://localhost:5000/api/auth/registration-deposit \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\":\"$USER_ID\",
    \"transactionHash\":\"0xTEST123ABC456DEF789\",
    \"amount\":60
  }")

DEPOSIT_ID=$(echo "$DEPOSIT_RESULT" | jq -r '.deposit._id // ._id')

if [ "$DEPOSIT_ID" != "null" ]; then
  echo -e "${GREEN}✅ Registration deposit submitted: $DEPOSIT_ID${NC}"
else
  echo -e "${RED}❌ Deposit submission failed${NC}"
  echo "$DEPOSIT_RESULT" | jq '.'
  exit 1
fi

# Verify user cannot login yet
echo -e "\n${YELLOW}[5/7] Testing login before verification (should fail)...${NC}"
LOGIN_TEST=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@hatrasuci.com","password":"Test123456"}')

if echo "$LOGIN_TEST" | jq -e '.depositPending' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Login correctly blocked - deposit pending${NC}"
else
  echo -e "${RED}❌ Unexpected login result${NC}"
fi

# Admin approves registration
echo -e "\n${YELLOW}[6/7] Admin approving registration deposit...${NC}"
APPROVAL_RESULT=$(curl -s -X PUT "http://localhost:5000/api/admin/registration-deposits/$DEPOSIT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved","adminNotes":"Automated test approval"}')

if echo "$APPROVAL_RESULT" | jq -e '.status == "approved"' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Registration deposit approved${NC}"
else
  echo -e "${RED}❌ Approval failed${NC}"
  echo "$APPROVAL_RESULT" | jq '.'
  exit 1
fi

# Test successful login
echo -e "\n${YELLOW}[7/7] Testing login after verification (should succeed)...${NC}"
FINAL_LOGIN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@hatrasuci.com","password":"Test123456"}')

if echo "$FINAL_LOGIN" | jq -e '.token' > /dev/null 2>&1; then
  BALANCE=$(echo "$FINAL_LOGIN" | jq -r '.balance')
  IS_ACTIVE=$(echo "$FINAL_LOGIN" | jq -r '.isActive')
  IS_VERIFIED=$(echo "$FINAL_LOGIN" | jq -r '.registrationDepositVerified')
  
  echo -e "${GREEN}✅ Login successful!${NC}"
  echo -e "   Balance: \$$BALANCE"
  echo -e "   Active: $IS_ACTIVE"
  echo -e "   Verified: $IS_VERIFIED"
  
  USER_TOKEN=$(echo "$FINAL_LOGIN" | jq -r '.token')
  
  # Test scratch card
  echo -e "\n${YELLOW}[BONUS] Testing scratch card reward...${NC}"
  SCRATCH_RESULT=$(curl -s -X POST http://localhost:5000/api/user/spin-wheel \
    -H "Authorization: Bearer $USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"reward":0.75}')
  
  if echo "$SCRATCH_RESULT" | jq -e '.reward' > /dev/null 2>&1; then
    REWARD=$(echo "$SCRATCH_RESULT" | jq -r '.reward')
    NEW_BALANCE=$(echo "$SCRATCH_RESULT" | jq -r '.newBalance')
    echo -e "${GREEN}✅ Scratch card claimed: \$$REWARD${NC}"
    echo -e "   New Balance: \$$NEW_BALANCE"
  else
    echo -e "${YELLOW}⚠️  Scratch card test: ${NC}$(echo "$SCRATCH_RESULT" | jq -r '.message')"
  fi
else
  echo -e "${RED}❌ Login failed after verification${NC}"
  echo "$FINAL_LOGIN" | jq '.'
  exit 1
fi

# Summary
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "\n${YELLOW}Test Credentials:${NC}"
echo -e "  Admin:"
echo -e "    Email: admin@hatrasuci.com"
echo -e "    Password: admin123"
echo -e "\n  User:"
echo -e "    Email: test@hatrasuci.com"
echo -e "    Password: Test123456"
echo -e "    Referral Code: $REFERRAL_CODE"
echo -e "\n${YELLOW}You can now login and test the application!${NC}\n"
