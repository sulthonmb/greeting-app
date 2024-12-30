export const CONFIGS = {
  GREETING_SYSTEM: {
    NAME: "greetingSystem",
    CONFIG: {
      greetingSystem: {
        messageTemplates: {
          birthday: "Hey, {fullName} it's your birthday!",
          anniversary: "Happy Anniversary, {fullName}!",
        },
        schedule: {
          birthday: {
            frequency: "yearly",
            time: "09:00:00",
            users: {
              select: [
                "users.id",
                "users.uuid",
                "users.first_name",
                "users.last_name",
                "users.email",
                "users.birth_date",
                "users.city",
                "users.country",
                "users.timezone",
              ],
              from: "users",
              where: [
                { field: "users.deleted_at", operator: "IS", value: "NULL" },
                {
                  field: "DATE_PART('day', users.birth_date)",
                  operator: "=",
                  value:
                    "DATE_PART('day', (NOW() AT TIME ZONE users.timezone))",
                },
                {
                  field: "DATE_PART('month', users.birth_date)",
                  operator: "=",
                  value:
                    "DATE_PART('month', (NOW() AT TIME ZONE users.timezone))",
                },
                {
                  field:
                    "(SELECT COUNT(*) FROM user_greeting_histories as greeting WHERE greeting.uuid_user=users.uuid AND greeting.status!='failed' AND DATE_PART('year', greeting.created_at) = DATE_PART('year', (NOW() AT TIME ZONE users.timezone)))",
                  operator: "<",
                  value: 1,
                },
              ],
            },
          },
        },
        userSchema: {
          fields: {
            uuid: "string",
            first_name: "string",
            last_name: "string",
            birth_date: "date",
            email: "string",
            city: "string",
            country: "string",
            timezone: "string",
          },
          requiredFields: ["firstName", "lastName", "birthDate", "timezone"],
        },
        settings: {
          skipWeekends: false,
        },
        delivery: {
          methods: ["email"],
          retryPolicy: {
            maxAttempts: 3,
            intervalSeconds: 300,
          },
        },
      },
    },
  },
};
