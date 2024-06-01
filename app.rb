require 'opal'
require 'glimmer-dsl-web'
require 'fileutils'

Opal.append_path "./lib"

Opal.use_gem("opal-jquery")
Opal.use_gem("glimmer-dsl-web")

builder = Opal::Builder.new
builder.build('glimmer-dsl-web')
builder.build("./script.js.rb")
FileUtils.mkdir_p "build"
compiled_source = builder.to_s
# compiled_source << "\n" << builder.source_map.to_data_uri_comment
File.binwrite "build/build.js", compiled_source
