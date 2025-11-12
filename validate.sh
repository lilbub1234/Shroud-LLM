#!/bin/bash
# Shroud LLM Validation Script
# Run this script to validate the Shroud LLM installation

echo "========================================="
echo "Shroud LLM Validation Script"
echo "========================================="
echo ""

ERRORS=0
WARNINGS=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print success
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
error() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# Check Node.js version
echo "1. Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        success "Node.js version: $(node -v)"
    else
        error "Node.js version $(node -v) is too old. Requires >= 18"
    fi
else
    error "Node.js is not installed"
fi
echo ""

# Check Yarn
echo "2. Checking Yarn..."
if command -v yarn &> /dev/null; then
    success "Yarn is installed: $(yarn -v)"
else
    warning "Yarn is not installed. You can install it with: npm install -g yarn"
fi
echo ""

# Check package.json files
echo "3. Validating package.json files..."
for pkg in package.json server/package.json frontend/package.json collector/package.json; do
    if [ -f "$pkg" ]; then
        if node -e "JSON.parse(require('fs').readFileSync('$pkg', 'utf8'))" 2>/dev/null; then
            NAME=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$pkg', 'utf8')).name)")
            if [[ $NAME == *"shroud-llm"* ]]; then
                success "$pkg is valid and rebranded"
            else
                warning "$pkg might not be fully rebranded (name: $NAME)"
            fi
        else
            error "$pkg is invalid JSON"
        fi
    else
        error "$pkg not found"
    fi
done
echo ""

# Check privacy modules syntax
echo "4. Validating privacy modules..."
for module in server/privacy/TimerBasedDeletion.js server/privacy/BYOK.js server/privacy/SmartRedaction.js server/privacy/index.js; do
    if [ -f "$module" ]; then
        if node -c "$module" 2>/dev/null; then
            success "$module syntax is valid"
        else
            error "$module has syntax errors"
        fi
    else
        error "$module not found"
    fi
done
echo ""

# Check environment files
echo "5. Checking environment configuration..."
for env in server/.env.example frontend/.env.example collector/.env.example docker/.env.example; do
    if [ -f "$env" ]; then
        success "$env exists"
    else
        error "$env not found"
    fi
done

# Check privacy env vars in server .env.example
if grep -q "ENABLE_TIMER_DELETION" server/.env.example && \
   grep -q "ENABLE_BYOK" server/.env.example && \
   grep -q "ENABLE_AUTO_REDACTION" server/.env.example; then
    success "Privacy environment variables documented"
else
    warning "Privacy environment variables may not be fully documented"
fi
echo ""

# Check database schema
echo "6. Validating database schema..."
if [ -f "server/prisma/schema.prisma" ]; then
    if grep -q "shroudllm.db" server/prisma/schema.prisma; then
        success "Database schema updated to shroudllm.db"
    else
        warning "Database schema may still reference old database name"
    fi
else
    error "Prisma schema not found"
fi
echo ""

# Check Docker configuration
echo "7. Validating Docker configuration..."
if [ -f "docker/Dockerfile" ]; then
    if grep -q "Shroud LLM" docker/Dockerfile; then
        success "Dockerfile rebranded"
    else
        warning "Dockerfile may not be fully rebranded"
    fi
else
    error "Dockerfile not found"
fi

if [ -f "docker/docker-compose.yml" ]; then
    if grep -q "shroudllm" docker/docker-compose.yml; then
        success "docker-compose.yml rebranded"
    else
        warning "docker-compose.yml may not be fully rebranded"
    fi
else
    error "docker-compose.yml not found"
fi
echo ""

# Check for remaining AnythingLLM references
echo "8. Checking for remaining AnythingLLM references..."
OLD_REFS=$(grep -r "AnythingLLM\|anything-llm\|anythingllm" \
    --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" \
    --exclude-dir=node_modules --exclude-dir=.git \
    server/ frontend/ collector/ 2>/dev/null | \
    grep -v "anything-llm.png" | \
    grep -v "@mintplex-labs" | \
    grep -v "NOTICE.md" | \
    grep -v "LICENSE.upstream" | \
    wc -l)

if [ "$OLD_REFS" -eq 0 ]; then
    success "No critical AnythingLLM references found"
else
    warning "Found $OLD_REFS references to old branding (may be in comments or dependencies)"
fi
echo ""

# Check logo files
echo "9. Validating logo files..."
LOGO_FILES=(
    "frontend/public/shroud-llm-light.png"
    "frontend/public/shroud-llm-dark.png"
    "frontend/src/media/logo/shroud-llm.png"
    "frontend/src/media/logo/shroud-llm-dark.png"
    "frontend/src/media/logo/shroud-llm-icon.png"
)

for logo in "${LOGO_FILES[@]}"; do
    if [ -f "$logo" ]; then
        success "$logo exists"
    else
        warning "$logo not found"
    fi
done
echo ""

# Check documentation
echo "10. Validating documentation..."
for doc in README.md CONTRIBUTING.md SECURITY.md NOTICE.md LICENSE LICENSE.upstream; do
    if [ -f "$doc" ]; then
        success "$doc exists"
    else
        warning "$doc not found"
    fi
done

if [ -f "server/privacy/README.md" ]; then
    success "Privacy features documentation exists"
else
    warning "Privacy features documentation not found"
fi
echo ""

# Summary
echo "========================================="
echo "Validation Summary"
echo "========================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Shroud LLM is ready to use!"
    echo ""
    echo "Next steps:"
    echo "1. Run 'yarn setup' to install dependencies"
    echo "2. Configure your .env files"
    echo "3. Run 'yarn dev:all' to start all services"
    echo "4. Or use 'docker-compose up' for Docker deployment"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Validation completed with $WARNINGS warning(s)${NC}"
    echo ""
    echo "Shroud LLM should work, but review the warnings above."
    exit 0
else
    echo -e "${RED}✗ Validation failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo ""
    echo "Please fix the errors above before proceeding."
    exit 1
fi
