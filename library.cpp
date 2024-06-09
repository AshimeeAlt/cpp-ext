// This code is based on https://github.com/PetterS/clang-wasm/blob/master/library.cpp
#include "nanolibc/libc.h"
#include "nanolibc/libc_extra.h"
#define WASM_EXPORT __attribute__((visibility("default"))) extern "C"

// Main extension
WASM_EXPORT int main() {
  print_string("Hello from WASM!\nExtension in C++ by Ashimee\n");
  return 0;
}

// Not implemented cause im stupid
struct extension
{
  char* id = "";
  char* name = "";
  char* color1 = "#ff0000";
  char* color2 = "#00ff00";
  char* color3 = "#0000ff";
};

extension makeInfo(char* id, char* name) {
  return (extension){id, name};
}
WASM_EXPORT extension getInfo() {
  return makeInfo("0znzwTest", "WASM");
}

// Blocks
WASM_EXPORT float add(float a, float b) {
  return a + b;
}