const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const json = require("koa-json");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const staticServer = require("koa-static");
const index = require("./routes/index");
const { ApolloServer } = require("apollo-server-koa");
const { typeDefs } = require("./graphql/schema");
const { resolvers } = require("./graphql/resolvers");

// middlewares
app.use(logger());

//渲染引擎
app.use(
  views(__dirname + "/views", {
    extension: "ejs"
  })
);
// bodyparser
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"]
  })
);
// pretty-json 美化json输出
app.use(json());

// routes allowedMethods方法自动设置status、丰富response的header
app.use(index.routes(), index.allowedMethods());

// 静态文件服务
app.use(staticServer(__dirname + '/vue-dist'))

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

// 创建graphql server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  debug: false 
});

// server.applyMiddleware({
//   app
// });
// alternatively you can get a composed middleware from the apollo server
app.use(server.getMiddleware());

app.listen({ port: 8000 }, () =>
  console.log(`🚀 Server ready at http://localhost:8000${server.graphqlPath}`)
);

module.exports = app;
