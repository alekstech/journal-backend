const { forwardTo } = require('prisma-binding');

const Query = {
  entriesConnection: forwardTo('db'),
  me(parent, args, ctx, info) {
    // check if there is a current user ID
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId },
      },
      info
    );
  },
  async entries(parent, args, ctx, info) {
    const { userId } = ctx.request;
    // 1. Make sure they are logged in
    if (!ctx.request.userId) {
      throw new Error('You arent logged in!');
    }
    // 2. Query items
    const entries = await ctx.db.query.entries(
      {
        where: {
          user: { id: userId },
        },
      },
      info
    );
    // 3. Return the order
    return entries;
  },
  async users(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!');
    }

    return ctx.db.query.users({}, info);
  },
};

module.exports = Query;
