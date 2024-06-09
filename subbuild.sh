echo Running clang...
clang \
--target=wasm32 \
--no-standard-libraries \
-Wl,--export-all -Wl,--no-entry \
-o extension.wasm \
main.cpp