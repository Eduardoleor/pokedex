const { withGradleProperties } = require('expo/config-plugins');

/**
 * Gradle settings applied on every prebuild: a larger heap for the C++/Kotlin compile
 * and the local build cache, so unchanged library tasks are reused between builds.
 */
const GRADLE_PROPERTIES = {
  'org.gradle.jvmargs': '-Xmx4g -XX:MaxMetaspaceSize=1g -Dfile.encoding=UTF-8',
  'org.gradle.caching': 'true',
};

module.exports = function withAndroidBuildSpeed(config) {
  return withGradleProperties(config, (gradleConfig) => {
    const keys = Object.keys(GRADLE_PROPERTIES);
    gradleConfig.modResults = gradleConfig.modResults.filter(
      (item) => item.type !== 'property' || !keys.includes(item.key),
    );
    for (const [key, value] of Object.entries(GRADLE_PROPERTIES)) {
      gradleConfig.modResults.push({ type: 'property', key, value });
    }
    return gradleConfig;
  });
};
