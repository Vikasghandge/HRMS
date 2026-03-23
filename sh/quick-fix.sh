#!/bin/bash

echo "🔧 HRMS Immediate Password Fix"
echo "================================"
echo ""

echo "📝 Step 1: Updating passwords in database..."

docker exec -i hrms-mysql mysql -uroot -proot123 <<EOF
USE hrms_db;

-- Update admin password to plain text
UPDATE users SET password = 'admin123' WHERE email = 'admin@hrms.com';

-- Update employee password to plain text  
UPDATE users SET password = 'employee123' WHERE email = 'employee@hrms.com';

-- Verify changes
SELECT email, password, role FROM users;
EOF

echo ""
echo "✅ Passwords updated in database!"
echo ""
echo "📝 Step 2: Checking backend authentication code..."
echo ""

# Check if bcrypt is still being used in auth
if grep -q "bcrypt.compare" backend/src/controllers/authController.js; then
    echo "⚠️  Found bcrypt in authController.js - Fixing..."
    
    # Create backup
    cp backend/src/controllers/authController.js backend/src/controllers/authController.js.backup
    
    # Replace bcrypt.compare with simple comparison
    sed -i 's/const isPasswordValid = await bcrypt.compare(password, user.password);/const isPasswordValid = (password === user.password);/g' backend/src/controllers/authController.js
    sed -i 's/if (!isPasswordValid)/if (!isPasswordValid)/g' backend/src/controllers/authController.js
    
    echo "✅ Fixed authController.js"
    echo "📦 Restarting backend..."
    docker-compose restart backend
    sleep 5
else
    echo "✅ Auth code already fixed"
fi

echo ""
echo "✅ Fix Complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Try logging in now:"
echo "   URL: http://localhost:3000"
echo ""
echo "🔐 Credentials:"
echo "   Admin:    admin@hrms.com / admin123"
echo "   Employee: employee@hrms.com / employee123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
