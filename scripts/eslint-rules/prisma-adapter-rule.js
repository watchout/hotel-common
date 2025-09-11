/**
 * カスタムESLintルール: Prismaアダプターの使用を強制する
 * 
 * このルールは、直接Prismaクライアントを使用するのではなく、
 * アダプターレイヤーを通じてアクセスすることを強制します。
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce using PrismaAdapter instead of direct PrismaClient',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      useAdapter: 'Use PrismaAdapter instead of direct PrismaClient. Import from "../database" and use hotelDb.getAdapter() instead.',
    },
  },
  create(context) {
    return {
      // new PrismaClient() の使用を検出
      'NewExpression[callee.name="PrismaClient"]'(node) {
        context.report({
          node,
          messageId: 'useAdapter',
          fix(fixer) {
            return fixer.replaceText(
              node,
              'hotelDb.getAdapter()'
            );
          },
        });
      },
      
      // prisma.model.method() の使用を検出
      'MemberExpression[object.object.name="prisma"]'(node) {
        if (node.object && node.object.object && node.object.object.name === 'prisma') {
          context.report({
            node,
            messageId: 'useAdapter',
          });
        }
      },
    };
  },
};

