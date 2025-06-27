// models/Video.js
module.exports = (sequelize, DataTypes) => {
  const Video = sequelize.define('Video', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('sample', 'full'),
      allowNull: false,
      defaultValue: 'sample',
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    youtube_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'videos', // Explicitly set table name if needed
    timestamps: true,     // Adds createdAt and updatedAt
    underscored: true     // Use snake_case in DB column names
  });

  return Video;
};
