module.exports = {
  apps: [
    {
      name: "app",
      script: "./app.js",
      instances: 0,
      exec_mode: "cluster",
      instance_var: "INSTANCE_ID",
    },
  ],
};