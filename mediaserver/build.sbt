name := """mediaserver"""
organization := "nico.ed.nnn"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.12.4"

libraryDependencies += guice
libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "3.1.2" % Test
libraryDependencies += "com.pauldijou" %% "jwt-core" % "0.14.1"
libraryDependencies += jdbc
libraryDependencies += "org.scalikejdbc" %% "scalikejdbc"  % "3.2.0"
libraryDependencies += "org.scalikejdbc" %% "scalikejdbc-config" % "3.2.0"
libraryDependencies += "org.scalikejdbc" %% "scalikejdbc-play-dbapi-adapter" % "2.6.0-scalikejdbc-3.2"
libraryDependencies += "mysql" % "mysql-connector-java" % "5.1.36"

// Adds additional packages into Twirl
//TwirlKeys.templateImports += "nico.ed.nnn.controllers._"

// Adds additional packages into conf/routes
// play.sbt.routes.RoutesKeys.routesImport += "nico.ed.nnn.binders._"
