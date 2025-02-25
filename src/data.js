const questions = [
    {
      "Qn": "Referred to Python, which of the following data type is Immutable Data types in Python",
      "Opt01": "String",
      "Opt02": "List",
      "Opt03": "Set",
      "Opt04": "Dict",
      "Qn_name": "QA111220001EM20"
    },
    {
      "Qn": "He runs more faster than me - Sentence Correction",
      "Opt01": "faster",
      "Opt02": "most faster",
      "Opt03": "fastest",
      "Opt04": "No correction required",
      "Qn_name": "QA111220001EM09"
    },
    {
      "Qn": "Fruit seller had some apples. He sells 30% apples and still has 560 apples. Originally, he had:",
      "Opt01": "800 apples",
      "Opt02": "440 apples",
      "Opt03": "672 apples",
      "Opt04": "700 apples",
      "Qn_name": "QA111220001EM05"
    },
    {
      "Qn": "Arti can do a piece of work in 4 hours; Bharti and Keerthi together can do it in 3 hours, while Arti and Keerthi together can do it in 2 hours. How long will Bharti alone take to do it?",
      "Opt01": "12 hours",
      "Opt02": "10 hours",
      "Opt03": "8 hours",
      "Opt04": "24 hours",
      "Qn_name": "QA111220001EM07"
    },
    {
      "Qn": "3 candidates contested an election and received 380, 753 and 995 votes respectively. What percentage of the total votes did the winning candidate get?",
      "Opt01": "46",
      "Opt02": "64",
      "Opt03": "38",
      "Opt04": "75",
      "Qn_name": "QA111220001EM06"
    },
    {
      "Qn": "Findout which of the following is not a storage class specifier in C?",
      "Opt01": "volatile",
      "Opt02": "static",
      "Opt03": "extern",
      "Opt04": "register",
      "Qn_name": "QA111220001EM16"
    },
    {
      "Qn": "int i = 5; while (1) { printf(\"%d \", i); i++; if (i == 9) { break; } } return 0;",
      "Opt01": "5 6 7 8",
      "Opt02": "5 9",
      "Opt03": "5 6 7 8 9",
      "Opt04": "While is not execute",
      "Qn_name": "QT111220001EM09"
    },
    {
      "Qn": "EARTH is written as FCUXM in a certain code. How is SATURN written in that code?",
      "Opt01": "TCWYWT",
      "Opt02": "TCWVXT",
      "Opt03": "TCWXWT",
      "Opt04": "TCWXUT",
      "Qn_name": "QA111220001EM01"
    },
    {
      "Qn": "What will be the output of the following Python program? z=list('3') z.append('5') z.insert(1,['0', '1']) print(z)",
      "Opt01": "['3','5', ['0','1']]",
      "Opt02": "['3', ['0','1'],'5']",
      "Opt03": "['3','5','0','1']",
      "Opt04": "List cannot have string numbers",
      "Qn_name": "QT111220001EM06"
    },
    {
      "Qn": "Select true about return type of functions in C?",
      "Opt01": "Functions can return any type except array and functions",
      "Opt02": "Functions can return any type",
      "Opt03": "Functions can return any type except array, functions and union",
      "Opt04": "Functions can return any type except array, functions, function pointer and union",
      "Qn_name": "QA111220001EM15"
    },
    {
      "Qn": "What will be the output of the following Python code? x = 'swapnodaya' for i in range(len(x)): print(i)",
      "Opt01": "0 1 2 3 4 5 6 7 8 9",
      "Opt02": "1 2 3 4 5 6 7 8 9 10",
      "Opt03": "10",
      "Opt04": "Error",
      "Qn_name": "QT111220001EM05"
    },
    {
      "Qn": "Sky is taller than earth but not taller than Moon. Moon and Star are of the same height. Sky is shorter than Sun. Amongst all the girls, who is/are the shortest? Read the information given above to answer the questions:",
      "Opt01": "Earth",
      "Opt02": "Moon and Star",
      "Opt03": "Sky",
      "Opt04": "Sun",
      "Qn_name": "QA111220001EM13"
    },
    {
      "Qn": "_____the fact that I never studied, I passed all of my tests - Complete the sentence by using correct option",
      "Opt01": "Despite",
      "Opt02": "Consequently",
      "Opt03": "Because",
      "Opt04": "As a result of",
      "Qn_name": "QA111220001EM10"
    },
    {
      "Qn": "Predict the output of the following pseudo-code if x= 3 and y=2: Integer solve(int x, int y) if(x > 1) solve(x \u2013 2, y + 4) end if print y End function solve()",
      "Opt01": "4",
      "Opt02": "2",
      "Opt03": "6",
      "Opt04": "3",
      "Qn_name": "QT111220001EM03"
    },
    {
      "Qn": "Sum of (62/127) and (62/508)?",
      "Opt01": "155/254",
      "Opt02": "124/635",
      "Opt03": "155/508",
      "Opt04": "310/127",
      "Qn_name": "QA111220001EM08"
    },
    {
      "Qn": "Choose which of the following is not a core data type in Python programming",
      "Opt01": "Class",
      "Opt02": "List",
      "Opt03": "Tuple",
      "Opt04": "Dict",
      "Qn_name": "QA111220001EM17"
    },
    {
      "Qn": "Sitting Problem: In a row of 10 chairs, if Chair Z is 3rd to the left of Chair X, and Chair X is 2nd to the right of Chair Y, who is sitting in the middle chair?",
      "Opt01": "X",
      "Opt02": "Z",
      "Opt03": "Cannot be determined",
      "Opt04": "Y",
      "Qn_name": "QA111220001EM12"
    },
    {
      "Qn": "Which of the following series will be printed by the given pseudocode? Integer a, b, c Set b = 0, c = 0 for(each a from 5 to 10) print c b = c c = b + 1 end for",
      "Opt01": "0 1 2 3 4 5",
      "Opt02": "5 4 3 2 1 0",
      "Opt03": "5 6 7 8 9 10",
      "Opt04": "0 1 2 3 4 5,... n",
      "Qn_name": "QT111220001EM02"
    },
    {
      "Qn": "What will be the output of the following program? for (int i = 3; i < 15; i = i+ 3) {printf (\"%d\", i); ++i; }",
      "Opt01": "3 7 11",
      "Opt02": "3 6 9 12 15",
      "Opt03": "3 7 11 15",
      "Opt04": "3",
      "Qn_name": "QT111220001EM07"
    },
    {
      "Qn": "In python Programming - which of the following is used to define a block of code",
      "Opt01": "Indentation",
      "Opt02": "Key",
      "Opt03": "Brackets",
      "Opt04": "None",
      "Qn_name": "QA111220001EM18"
    },
    {
      "Qn": "Find the odd pair of letters from the given list.",
      "Opt01": "FEG",
      "Opt02": "ZXB",
      "Opt03": "BAD",
      "Opt04": "ONQ",
      "Qn_name": "QA111220001EM11"
    },
    {
      "Qn": "What is the output? Integer x, y Set x = 8, y = 4 do{ Print x x = x + y + 1 } while(x < 15) end do while",
      "Opt01": "8 13",
      "Opt02": "8 12",
      "Opt03": "13 8",
      "Opt04": "8 4",
      "Qn_name": "QT111220001EM04"
    },
    {
      "Qn": "DELHI is written as EDMGJ in a certain code. How is BIJAPUR written in that code?",
      "Opt01": "CHKZQTS",
      "Opt02": "CHIZQTS",
      "Opt03": "CHKYQTS",
      "Opt04": "CHKZPTS",
      "Qn_name": "QA111220001EM02"
    },
    {
      "Qn": "EJO, TYD, INS, ____ Findout missing series",
      "Opt01": "XCH",
      "Opt02": "XCI",
      "Opt03": "HCX",
      "Opt04": "HXC",
      "Qn_name": "QA111220001EM04"
    },
    {
      "Qn": "Refer to python - which one of the following is the use of function",
      "Opt01": "Functions are reusable pieces of programs",
      "Opt02": "you can\u2019t also create your own functions",
      "Opt03": "Functions don\u2019t provide better modularity for your application",
      "Opt04": "All of the mentioned",
      "Qn_name": "QA111220001EM19"
    },
    {
      "Qn": "for(int i=4;i<10;i++) { if(i < 8) { printf(\"%d \", i); i++; }}",
      "Opt01": "4 6",
      "Opt02": "4 5 6 8",
      "Opt03": "4 6 8 10",
      "Opt04": "4 8",
      "Qn_name": "QT111220001EM10"
    },
    {
      "Qn": "Findout missing series ABC, GHI, NOP, ____",
      "Opt01": "VWX",
      "Opt02": "XVW",
      "Opt03": "VXW",
      "Opt04": "WVX",
      "Qn_name": "QA111220001EM03"
    },
    {
      "Qn": "Parameters are always in C Programming",
      "Opt01": "Passed by value",
      "Opt02": "Passed by reference",
      "Opt03": "Non-pointer variables are passed by value and pointers are passed by reference",
      "Opt04": "Passed by value result",
      "Qn_name": "QA111220001EM14"
    },
    {
      "Qn": "int main() { int i = 5; if(i < '5') printf(\"%d\", i); else printf(\"Not equal to 5.\"); }",
      "Opt01": "5",
      "Opt02": "'5'",
      "Opt03": "Not equal to 5",
      "Opt04": "error",
      "Qn_name": "QT111220001EM08"
    },
    {
      "Qn": "Which of the following series will be printed by the given pseudocode? Integer a, b, c Set b = 6, c = 7 for(each a from 1 to 3) print c b = b - 1 c = c + b end for",
      "Opt01": "7 12 16",
      "Opt02": "1 2 3",
      "Opt03": "8 9 10",
      "Opt04": "3 6 9",
      "Qn_name": "QT111220001EM01"
    }

];

export default questions;
